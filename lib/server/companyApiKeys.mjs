import crypto from 'node:crypto';

const ALLOWED_SCOPES = new Set(['import.properties', 'import.users']);

function createSecurityError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseScopes(value) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => normalizeString(entry)).filter((entry) => entry);
}

function toHashInput(secret) {
  const pepper = normalizeString(process.env.API_KEY_PEPPER);
  return pepper ? `${pepper}:${secret}` : secret;
}

export function hashApiKeySecret(secret) {
  const normalized = normalizeString(secret);
  if (!normalized) throw new Error('API key secret is required.');
  return crypto.createHash('sha256').update(toHashInput(normalized), 'utf8').digest('hex');
}

export function generateApiKeySecret() {
  return crypto.randomBytes(24).toString('hex');
}

function compareHash(expectedHex, actualHex) {
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = Buffer.from(actualHex, 'hex');
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

export async function verifyCompanyApiKey({
  keyId,
  keySecret,
  requiredScope,
  deps,
  nowIso,
}) {
  const normalizedKeyId = normalizeString(keyId);
  const normalizedSecret = normalizeString(keySecret);
  if (!normalizedKeyId || !normalizedSecret) {
    throw createSecurityError(401, 'api_key_missing', 'API key credentials are required.');
  }
  const record = await deps.getKeyRecord(normalizedKeyId);
  if (!record) throw createSecurityError(401, 'api_key_invalid', 'Invalid API key credentials.');
  const status = normalizeString(record.status);
  if (status !== 'active') throw createSecurityError(401, 'api_key_inactive', 'API key is inactive.');

  const expiresAt = normalizeString(record.expiresAt);
  const now = nowIso || new Date().toISOString();
  if (expiresAt && expiresAt <= now) {
    throw createSecurityError(401, 'api_key_expired', 'API key is expired.');
  }

  const companyId = normalizeString(record.companyId);
  if (!companyId) {
    throw createSecurityError(401, 'api_key_invalid', 'API key record is invalid.');
  }

  const recordScopes = parseScopes(record.scopes);
  if (!recordScopes.includes(requiredScope)) {
    throw createSecurityError(403, 'api_key_scope_forbidden', `API key missing required scope ${requiredScope}.`);
  }

  const storedHash = normalizeString(record.keyHash);
  if (!storedHash) throw createSecurityError(401, 'api_key_invalid', 'API key record is invalid.');
  const suppliedHash = hashApiKeySecret(normalizedSecret);
  if (!compareHash(storedHash, suppliedHash)) {
    throw createSecurityError(401, 'api_key_invalid', 'Invalid API key credentials.');
  }

  await deps.touchLastUsedAt(normalizedKeyId, now);
  return {
    keyId: normalizedKeyId,
    companyId,
    scopes: recordScopes,
  };
}

async function defaultApiKeyDeps() {
  const mod = await import('./firebaseAdmin');
  return {
    getKeyRecord: async (nextKeyId) => {
      const snap = await mod.adminDb().collection('api_keys').doc(nextKeyId).get();
      if (!snap.exists) return null;
      return snap.data() || null;
    },
    touchLastUsedAt: async (nextKeyId, at) => {
      await mod.adminDb().collection('api_keys').doc(nextKeyId).set(
        {
          lastUsedAt: at,
          updatedAt: at,
        },
        { merge: true }
      );
    },
  };
}

export async function requireCompanyApiKey(request, requiredScope, depsOverride) {
  const keyId = request.headers.get('x-api-key-id');
  const keySecret = request.headers.get('x-api-key-secret');
  const deps = depsOverride || (await defaultApiKeyDeps());
  return await verifyCompanyApiKey({
    keyId,
    keySecret,
    requiredScope,
    deps,
  });
}

export function sanitizeApiKeyScopes(value) {
  const scopes = parseScopes(value);
  if (scopes.length === 0) {
    throw createSecurityError(400, 'validation_error', 'At least one scope is required.');
  }
  const unique = Array.from(new Set(scopes));
  for (const scope of unique) {
    if (!ALLOWED_SCOPES.has(scope)) {
      throw createSecurityError(400, 'validation_error', `Unsupported scope: ${scope}.`);
    }
  }
  return unique;
}
