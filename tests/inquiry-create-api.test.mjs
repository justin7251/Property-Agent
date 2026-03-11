import test from 'node:test';
import assert from 'node:assert/strict';
import { processInquiryCreate } from '../lib/server/inquiryCreate.mjs';

function createMemoryDeps(seed = {}) {
  const stores = {
    agents: new Map(),
    properties: new Map(),
    inquiries: new Map(),
    api_idempotency: new Map(),
  };
  for (const [collection, items] of Object.entries(seed)) {
    const map = stores[collection];
    if (!map) continue;
    for (const [id, data] of Object.entries(items)) {
      map.set(id, { ...data });
    }
  }
  let seq = 0;

  return {
    stores,
    async readIdempotentResponse(companyId, routeKey, key) {
      return stores.api_idempotency.get(`${companyId}:${routeKey}:${key}`) || null;
    },
    async writeIdempotentResponse(companyId, actorUserId, routeKey, key, status, payload) {
      stores.api_idempotency.set(`${companyId}:${routeKey}:${key}`, { status, payload, companyId, actorUserId, routeKey, key });
    },
    async getDoc(path, id) {
      const data = stores[path]?.get(id);
      return { exists: !!data, data: data || {} };
    },
    async addDoc(path, data) {
      const id = `${path}_${++seq}`;
      stores[path].set(id, { ...data });
      return { id };
    },
  };
}

const actor = {
  userId: 'u-admin',
  companyId: 'c-1',
  role: 'admin',
  permissions: {},
  isPlatformSuperadmin: false,
};

test('processInquiryCreate creates inquiry with normalized response', async () => {
  const deps = createMemoryDeps({
    agents: { a1: { companyId: 'c-1' } },
    properties: { p1: { companyId: 'c-1' } },
  });
  const result = await processInquiryCreate({
    actor,
    payload: {
      clientName: 'Jane Doe',
      clientEmail: 'JANE@EXAMPLE.COM',
      propertyId: 'p1',
      propertyTitle: 'Unit 101',
      agentId: 'a1',
      message: 'Interested in scheduling a viewing.',
    },
    deps,
  });

  assert.equal(result.status, 200);
  assert.equal(result.payload.ok, true);
  assert.equal(typeof result.payload.inquiryId, 'string');
  assert.equal(result.payload.status, 'new');
  assert.equal(typeof result.payload.createdAt, 'string');
  assert.equal(deps.stores.inquiries.size, 1);
});

test('processInquiryCreate rejects invalid payload', async () => {
  const deps = createMemoryDeps({
    agents: { a1: { companyId: 'c-1' } },
    properties: { p1: { companyId: 'c-1' } },
  });
  await assert.rejects(
    () =>
      processInquiryCreate({
        actor,
        payload: {
          clientName: '',
          clientEmail: 'bad-email',
          propertyId: 'p1',
          propertyTitle: 'Unit 101',
          agentId: 'a1',
          message: '',
        },
        deps,
      }),
    /required|valid email/i
  );
});

test('processInquiryCreate rejects cross-company injection', async () => {
  const deps = createMemoryDeps({
    agents: { a1: { companyId: 'c-1' } },
    properties: { p1: { companyId: 'c-2' } },
  });
  await assert.rejects(
    () =>
      processInquiryCreate({
        actor,
        payload: {
          clientName: 'Jane Doe',
          clientEmail: 'jane@example.com',
          propertyId: 'p1',
          propertyTitle: 'Unit 101',
          agentId: 'a1',
          message: 'Interested',
        },
        deps,
      }),
    /Cross-company/i
  );
});

test('processInquiryCreate supports idempotent replay', async () => {
  const deps = createMemoryDeps({
    agents: { a1: { companyId: 'c-1' } },
    properties: { p1: { companyId: 'c-1' } },
  });
  const input = {
    actor,
    payload: {
      clientName: 'Jane Doe',
      clientEmail: 'jane@example.com',
      propertyId: 'p1',
      propertyTitle: 'Unit 101',
      agentId: 'a1',
      message: 'Interested',
      idempotencyKey: 'inquiry-key-1',
    },
    deps,
  };

  const first = await processInquiryCreate(input);
  const before = deps.stores.inquiries.size;
  const second = await processInquiryCreate(input);
  const after = deps.stores.inquiries.size;

  assert.equal(first.payload.inquiryId, second.payload.inquiryId);
  assert.equal(before, after);
  assert.equal(after, 1);
});
