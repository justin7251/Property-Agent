import { NextRequest, NextResponse } from 'next/server';
import { processInquiryCreate } from '../../../../lib/server/inquiryCreate.mjs';
import { adminDb } from '../../../../lib/server/firebaseAdmin';
import { readIdempotentResponse, writeIdempotentResponse } from '../../../../lib/server/idempotency';
import {
  enforceRateLimit,
  getRequestIdempotencyKey,
  readJsonBody,
  requireBearerAuth,
  requirePermission,
  securityErrorResponse,
} from '../../../../lib/server/security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const actor = await requireBearerAuth(request);
    requirePermission(actor, 'inquiry.write');
    enforceRateLimit(request, { routeKey: 'inquiries_create', limit: 40, windowMs: 60_000, actor });
    const payload = await readJsonBody<Record<string, unknown>>(request);
    const response = await processInquiryCreate({
      actor,
      payload,
      idempotencyKey: getRequestIdempotencyKey(request, payload) || undefined,
      deps: {
        readIdempotentResponse,
        writeIdempotentResponse,
        getDoc: async (path: string, id: string) => {
          const snap = await adminDb().collection(path).doc(id).get();
          return { exists: snap.exists, data: (snap.data() as Record<string, unknown>) || {} };
        },
        addDoc: async (path: string, data: Record<string, unknown>) => {
          const ref = await adminDb().collection(path).add(data);
          return { id: ref.id };
        },
      },
    });
    return NextResponse.json(response.payload, { status: response.status });
  } catch (error) {
    return securityErrorResponse(error, 'Failed to create inquiry.');
  }
}
