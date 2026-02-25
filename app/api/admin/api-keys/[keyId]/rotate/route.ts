import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../../../lib/server/firebaseAdmin';
import { generateApiKeySecret, hashApiKeySecret } from '../../../../../../lib/server/companyApiKeys.mjs';
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
    enforceRateLimit(request, { routeKey: 'admin_api_key_rotate', limit: 20, windowMs: 60_000, actor });

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

    const status = typeof data.status === 'string' ? data.status : 'active';
    if (status === 'revoked') {
      return NextResponse.json({ error: 'Revoked keys cannot be rotated.' }, { status: 400 });
    }

    const keySecret = generateApiKeySecret();
    const keyHash = hashApiKeySecret(keySecret);
    const now = new Date().toISOString();
    await ref.set(
      {
        keyHash,
        status: 'active',
        lastUsedAt: null,
        updatedAt: now,
        updatedBy: actor.userId,
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      keyId: normalized,
      keySecret,
      status: 'active',
    });
  } catch (error) {
    return securityErrorResponse(error, 'Failed to rotate API key.');
  }
}
