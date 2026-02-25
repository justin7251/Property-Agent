import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/server/firebaseAdmin';
import {
  generateApiKeySecret,
  hashApiKeySecret,
  sanitizeApiKeyScopes,
} from '../../../../../lib/server/companyApiKeys.mjs';
import {
  enforceRateLimit,
  parseString,
  readJsonBody,
  requireBearerAuth,
  requirePermission,
  securityErrorResponse,
  validateRequestSchema,
} from '../../../../../lib/server/security';

export const runtime = 'nodejs';

type CreateApiKeyPayload = {
  scopes: string[];
  expiresAt?: string;
};

function parseExpiresAt(value: unknown): string | null {
  const raw = parseString(value);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireBearerAuth(request);
    requirePermission(actor, 'user.role.assign');
    enforceRateLimit(request, { routeKey: 'admin_api_key_create', limit: 20, windowMs: 60_000, actor });

    const payload = await readJsonBody<CreateApiKeyPayload>(request);
    const parsed = validateRequestSchema(payload, {
      scopes: { required: true, parse: (value) => sanitizeApiKeyScopes(value), message: 'At least one valid scope is required.' },
      expiresAt: { required: false, parse: (value) => parseExpiresAt(value), message: 'Invalid expiresAt.' },
    });

    if (payload.expiresAt && !parsed.expiresAt) {
      return NextResponse.json({ error: 'Invalid expiresAt.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const keyId = adminDb().collection('api_keys').doc().id;
    const keySecret = generateApiKeySecret();
    const keyHash = hashApiKeySecret(keySecret);

    await adminDb().collection('api_keys').doc(keyId).set({
      keyId,
      companyId: actor.companyId,
      keyHash,
      scopes: parsed.scopes,
      status: 'active',
      expiresAt: parsed.expiresAt || null,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now,
      createdBy: actor.userId,
      updatedBy: actor.userId,
    });

    return NextResponse.json({
      ok: true,
      keyId,
      keySecret,
      scopes: parsed.scopes,
      status: 'active',
      expiresAt: parsed.expiresAt || null,
    });
  } catch (error) {
    return securityErrorResponse(error, 'Failed to create API key.');
  }
}
