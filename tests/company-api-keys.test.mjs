import test from 'node:test';
import assert from 'node:assert/strict';
import { hashApiKeySecret, sanitizeApiKeyScopes, verifyCompanyApiKey } from '../lib/server/companyApiKeys.mjs';

function createDeps(record) {
  let touched = null;
  return {
    touchedRef: () => touched,
    deps: {
      async getKeyRecord(keyId) {
        if (keyId !== 'k-1') return null;
        return record;
      },
      async touchLastUsedAt(keyId, at) {
        touched = { keyId, at };
      },
    },
  };
}

test('verifyCompanyApiKey accepts active key with scope', async () => {
  const secret = 'secret-123';
  const record = {
    companyId: 'c-1',
    keyHash: hashApiKeySecret(secret),
    scopes: ['import.properties'],
    status: 'active',
    expiresAt: null,
  };
  const holder = createDeps(record);
  const verified = await verifyCompanyApiKey({
    keyId: 'k-1',
    keySecret: secret,
    requiredScope: 'import.properties',
    deps: holder.deps,
    nowIso: '2026-02-25T10:00:00.000Z',
  });
  assert.equal(verified.companyId, 'c-1');
  assert.equal(verified.keyId, 'k-1');
  assert.deepEqual(holder.touchedRef(), { keyId: 'k-1', at: '2026-02-25T10:00:00.000Z' });
});

test('verifyCompanyApiKey rejects missing scope', async () => {
  const secret = 'secret-123';
  const record = {
    companyId: 'c-1',
    keyHash: hashApiKeySecret(secret),
    scopes: ['import.properties'],
    status: 'active',
    expiresAt: null,
  };
  const holder = createDeps(record);
  await assert.rejects(
    () =>
      verifyCompanyApiKey({
        keyId: 'k-1',
        keySecret: secret,
        requiredScope: 'import.users',
        deps: holder.deps,
      }),
    /missing required scope/i
  );
});

test('verifyCompanyApiKey rejects revoked and expired keys', async () => {
  const secret = 'secret-123';
  const revoked = createDeps({
    companyId: 'c-1',
    keyHash: hashApiKeySecret(secret),
    scopes: ['import.users'],
    status: 'revoked',
    expiresAt: null,
  });
  await assert.rejects(
    () =>
      verifyCompanyApiKey({
        keyId: 'k-1',
        keySecret: secret,
        requiredScope: 'import.users',
        deps: revoked.deps,
      }),
    /inactive/i
  );

  const expired = createDeps({
    companyId: 'c-1',
    keyHash: hashApiKeySecret(secret),
    scopes: ['import.users'],
    status: 'active',
    expiresAt: '2026-02-24T00:00:00.000Z',
  });
  await assert.rejects(
    () =>
      verifyCompanyApiKey({
        keyId: 'k-1',
        keySecret: secret,
        requiredScope: 'import.users',
        deps: expired.deps,
        nowIso: '2026-02-25T00:00:00.000Z',
      }),
    /expired/i
  );
});

test('sanitizeApiKeyScopes rejects unsupported scope', () => {
  assert.throws(() => sanitizeApiKeyScopes(['import.properties', 'unknown.scope']), /Unsupported scope/);
});
