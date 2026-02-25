import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../../../lib/server/firebaseAdmin';
import {
  enforceRateLimit,
  requireBearerAuth,
  requirePermission,
  requireTenantScope,
  securityErrorResponse,
} from '../../../../../../lib/server/security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, context: { params: Promise<{ keyId: string }> }) {
  try {
    const actor = await requireBearerAuth(request);
    requirePermission(actor, 'user.role.assign');
    enforceRateLimit(request, { routeKey: 'admin_api_key_revoke', limit: 25, windowMs: 60_000, actor });

    const { keyId } = await context.params;
    const normalized = typeof keyId === 'string' ? keyId.trim() : '';
    if (!normalized) {
      return NextResponse.json({ error: 'keyId is required.' }, { status: 400 });
    }

    const ref = adminDb().collection('api_keys').doc(normalized);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'API key not found.' }, { status: 404 });
    }
    const data = snap.data() as Record<string, unknown>;
    requireTenantScope(actor, typeof data.companyId === 'string' ? data.companyId : '', 'Cross-company API key update is forbidden.');

    await ref.set(
      {
        status: 'revoked',
        updatedAt: new Date().toISOString(),
        updatedBy: actor.userId,
      },
      { merge: true }
    );
    return NextResponse.json({ ok: true, keyId: normalized, status: 'revoked' });
  } catch (error) {
    return securityErrorResponse(error, 'Failed to revoke API key.');
  }
}
