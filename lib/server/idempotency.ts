import { adminDb } from './firebaseAdmin';

type IdempotentRecord = {
  companyId: string;
  actorUserId: string;
  routeKey: string;
  key: string;
  status: number;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
};

function buildDocId(companyId: string, routeKey: string, key: string): string {
  return `${companyId}__${routeKey}__${key}`.replace(/[^a-zA-Z0-9_\-:.]/g, '_');
}

export async function readIdempotentResponse(
  companyId: string,
  routeKey: string,
  key: string
): Promise<{ status: number; payload: unknown } | null> {
  const snapshot = await adminDb().collection('api_idempotency').doc(buildDocId(companyId, routeKey, key)).get();
  if (!snapshot.exists) return null;
  const data = snapshot.data() as Partial<IdempotentRecord>;
  if (!data) return null;
  return {
    status: typeof data.status === 'number' ? data.status : 200,
    payload: data.payload,
  };
}

export async function writeIdempotentResponse(
  companyId: string,
  actorUserId: string,
  routeKey: string,
  key: string,
  status: number,
  payload: unknown
): Promise<void> {
  const now = new Date().toISOString();
  await adminDb().collection('api_idempotency').doc(buildDocId(companyId, routeKey, key)).set(
    {
      companyId,
      actorUserId,
      routeKey,
      key,
      status,
      payload,
      createdAt: now,
      updatedAt: now,
    } as IdempotentRecord,
    { merge: true }
  );
}
