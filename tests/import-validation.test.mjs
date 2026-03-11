import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCompanyRole,
  parseImportEnvelope,
  sanitizePropertyImportRow,
  sanitizePropertyPatch,
  sanitizeUserImportRow,
  sanitizeUserPatch,
} from '../lib/server/importValidation.mjs';

test('parseImportEnvelope validates rows and idempotency key', () => {
  const parsed = parseImportEnvelope({
    rows: [{ name: 'a' }],
    idempotencyKey: '  key-123 ',
  });
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.idempotencyKey, 'key-123');
});

test('sanitizePropertyPatch rejects unsupported fields', () => {
  const result = sanitizePropertyPatch({ unknown: 'x' });
  assert.equal(result.ok, false);
  assert.match(result.error, /Unsupported field/);
});

test('sanitizePropertyImportRow accepts valid property row', () => {
  const result = sanitizePropertyImportRow({
    title: 'A',
    address: 'B',
    price: 1000,
    priceUnit: 'mo',
    status: 'available',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    sqft: 700,
    agentId: 'a1',
    landlordId: 'l1',
    images: [],
  });
  assert.equal(result.ok, true);
});

test('sanitizeUserPatch blocks role escalation fields', () => {
  const result = sanitizeUserPatch({ role: 'admin' });
  assert.equal(result.ok, false);
  assert.match(result.error, /Forbidden field/);
});

test('sanitizeUserImportRow validates email and role', () => {
  const ok = sanitizeUserImportRow({ name: 'John', email: 'john@agency.com', role: 'agent' });
  assert.equal(ok.ok, true);
  const bad = sanitizeUserImportRow({ name: 'John', email: 'bad-email', role: 'agent' });
  assert.equal(bad.ok, false);
});

test('parseCompanyRole only accepts company roles', () => {
  assert.equal(parseCompanyRole('admin'), 'admin');
  assert.equal(parseCompanyRole('superadmin'), null);
});

