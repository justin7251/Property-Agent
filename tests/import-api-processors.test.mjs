import test from 'node:test';
import assert from 'node:assert/strict';
import { processPropertiesImport, processUsersImport } from '../lib/server/importProcessors.mjs';

function createMemoryDeps(seed = {}) {
  const stores = {
    users: new Map(),
    agents: new Map(),
    landlords: new Map(),
    properties: new Map(),
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
      const map = stores[path];
      const data = map?.get(id);
      return { exists: !!data, data: data || {} };
    },
    async setDoc(path, id, data, options = {}) {
      const map = stores[path];
      const current = map.get(id) || {};
      map.set(id, options.merge ? { ...current, ...data } : { ...data });
    },
    async updateDoc(path, id, data) {
      const map = stores[path];
      const current = map.get(id) || {};
      map.set(id, { ...current, ...data });
    },
    async addDoc(path, data) {
      const id = `${path}_${++seq}`;
      stores[path].set(id, { ...data });
      return { id };
    },
    newId(path) {
      return `${path}_${++seq}`;
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

test('processPropertiesImport imports valid rows and reports invalid rows', async () => {
  const deps = createMemoryDeps({
    agents: { a1: { companyId: 'c-1' } },
    landlords: { l1: { companyId: 'c-1' } },
  });
  const { status, payload } = await processPropertiesImport({
    actor,
    payload: {
      rows: [
        {
          title: 'P1',
          address: 'Addr',
          price: 1200,
          priceUnit: 'mo',
          status: 'available',
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          sqft: 750,
          agentId: 'a1',
          landlordId: 'l1',
          images: [],
        },
        { title: 'invalid-row' },
      ],
      importedByKeyId: 'key-1',
    },
    deps,
  });
  assert.equal(status, 200);
  assert.equal(payload.accepted, 2);
  assert.equal(payload.succeeded, 1);
  assert.equal(payload.failed.length, 1);
  const inserted = Array.from(deps.stores.properties.values())[0];
  assert.equal(inserted.source, 'api_key_import');
  assert.equal(inserted.importedByKeyId, 'key-1');
});

test('processUsersImport enforces role assignment rules', async () => {
  const deps = createMemoryDeps();
  const { payload } = await processUsersImport({
    actor: { ...actor, role: 'team_lead' },
    payload: {
      rows: [
        { name: 'A', email: 'a@x.com', role: 'agent' },
        { name: 'B', email: 'b@x.com', role: 'admin' },
      ],
    },
    deps,
  });
  assert.equal(payload.accepted, 2);
  assert.equal(payload.succeeded, 1);
  assert.equal(payload.failed.length, 1);
  assert.match(payload.failed[0].error, /cannot assign role/i);
});

test('processUsersImport supports idempotent replay', async () => {
  const deps = createMemoryDeps();
  const input = {
    actor,
    payload: {
      rows: [{ name: 'John', email: 'john@x.com', role: 'agent' }],
      idempotencyKey: 'k-1',
    },
    deps,
  };
  const first = await processUsersImport(input);
  const before = deps.stores.users.size;
  const second = await processUsersImport(input);
  const after = deps.stores.users.size;
  assert.equal(first.payload.succeeded, 1);
  assert.equal(second.payload.succeeded, 1);
  assert.equal(before, after);
});

test('processUsersImport stamps api key audit fields', async () => {
  const deps = createMemoryDeps();
  const { payload } = await processUsersImport({
    actor,
    payload: {
      rows: [{ name: 'Jane', email: 'jane@x.com', role: 'agent' }],
      importedByKeyId: 'key-2',
    },
    deps,
  });
  assert.equal(payload.succeeded, 1);
  const inserted = Array.from(deps.stores.users.values())[0];
  assert.equal(inserted.source, 'api_key_import');
  assert.equal(inserted.importedByKeyId, 'key-2');
});
