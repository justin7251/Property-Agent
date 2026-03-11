import test from 'node:test';
import assert from 'node:assert/strict';
import { findPublicSecretExposure, parseEnvKeys } from '../lib/server/envHygiene.mjs';

test('parseEnvKeys extracts keys and ignores comments', () => {
  const keys = parseEnvKeys(`
# note
NEXT_PUBLIC_APP_URL=https://example.com
FIREBASE_ADMIN_PRIVATE_KEY=abc
`);
  assert.deepEqual(keys, ['NEXT_PUBLIC_APP_URL', 'FIREBASE_ADMIN_PRIVATE_KEY']);
});

test('findPublicSecretExposure flags secret-like NEXT_PUBLIC keys', () => {
  const flagged = findPublicSecretExposure([
    'NEXT_PUBLIC_API_KEY_SECRET',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'FIREBASE_ADMIN_PRIVATE_KEY',
  ]);
  assert.deepEqual(flagged, ['NEXT_PUBLIC_API_KEY_SECRET']);
});
