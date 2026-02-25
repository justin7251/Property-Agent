import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/server/firebaseAdmin';
import { requireCompanyApiKey } from '../../../../lib/server/companyApiKeys.mjs';
import { readIdempotentResponse, writeIdempotentResponse } from '../../../../lib/server/idempotency';
import { processPropertiesImport } from '../../../../lib/server/importProcessors.mjs';
import {
  enforceRateLimit,
  getRequestIdempotencyKey,
  parseString,
  readJsonBody,
  securityErrorResponse,
  validateRequestSchema,
} from '../../../../lib/server/security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const keyContext = await requireCompanyApiKey(request, 'import.properties');
    enforceRateLimit(request, {
      routeKey: 'properties_import',
      limit: 30,
      windowMs: 60_000,
      actor: { userId: `key:${keyContext.keyId}`, companyId: keyContext.companyId, role: 'owner' },
    });

    const payload = await readJsonBody<Record<string, unknown>>(request);
    const baseline = validateRequestSchema(payload, {
      rows: { required: true, parse: (value) => (Array.isArray(value) ? value : []), message: 'rows must be a non-empty array.' },
      idempotencyKey: { required: false, parse: (value) => parseString(value), message: 'Invalid idempotency key.' },
    });
    const idempotencyKey = getRequestIdempotencyKey(request, payload);
    const response = await processPropertiesImport({
      actor: {
        userId: `api_key:${keyContext.keyId}`,
        companyId: keyContext.companyId,
        role: 'owner',
        isPlatformSuperadmin: false,
      },
      payload: {
        rows: baseline.rows,
        idempotencyKey: idempotencyKey || baseline.idempotencyKey || undefined,
        importedByKeyId: keyContext.keyId,
      },
      deps: {
        readIdempotentResponse,
        writeIdempotentResponse,
        getDoc: async (path: string, id: string) => {
          const snap = await adminDb().collection(path).doc(id).get();
          return { exists: snap.exists, data: (snap.data() as Record<string, unknown>) || {} };
        },
        setDoc: async (path: string, id: string, data: Record<string, unknown>, options?: { merge?: boolean }) => {
          if (options) {
            await adminDb().collection(path).doc(id).set(data, options);
            return;
          }
          await adminDb().collection(path).doc(id).set(data);
        },
        updateDoc: async (path: string, id: string, data: Record<string, unknown>) => {
          await adminDb().collection(path).doc(id).update(data);
        },
        addDoc: async (path: string, data: Record<string, unknown>) => {
          const ref = await adminDb().collection(path).add(data);
          return { id: ref.id };
        },
      },
    });
    return NextResponse.json(response.payload, { status: response.status });
  } catch (error) {
    return securityErrorResponse(error, 'Failed to import properties.');
  }
}

