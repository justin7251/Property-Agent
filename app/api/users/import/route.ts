import { NextRequest, NextResponse } from 'next/server';
import { assertCanPerform } from '../../../../lib/auth/policy';
import { adminDb } from '../../../../lib/server/firebaseAdmin';
import { readIdempotentResponse, writeIdempotentResponse } from '../../../../lib/server/idempotency';
import { processUsersImport } from '../../../../lib/server/importProcessors.mjs';
import { requireServerAuthContext } from '../../../../lib/server/requestAuth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const actor = await requireServerAuthContext(request);
    assertCanPerform(actor, 'user.role.assign');

    const payload = await request.json();
    const response = await processUsersImport({
      actor,
      payload,
      deps: {
        readIdempotentResponse,
        writeIdempotentResponse,
        getDoc: async (path: string, id: string) => {
          const snap = await adminDb().collection(path).doc(id).get();
          return { exists: snap.exists, data: (snap.data() as Record<string, unknown>) || {} };
        },
        setDoc: async (path: string, id: string, data: Record<string, unknown>, options?: { merge?: boolean }) => {
          await adminDb().collection(path).doc(id).set(data, options);
        },
        addDoc: async (path: string, data: Record<string, unknown>) => {
          const ref = await adminDb().collection(path).add(data);
          return { id: ref.id };
        },
        updateDoc: async (path: string, id: string, data: Record<string, unknown>) => {
          await adminDb().collection(path).doc(id).update(data);
        },
        newId: (collectionName: string) => adminDb().collection(collectionName).doc().id,
      },
    });
    return NextResponse.json(response.payload, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import users.';
    const status = message.includes('Missing bearer token') ? 401 : message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

