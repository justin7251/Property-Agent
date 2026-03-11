import test from 'node:test';
import assert from 'node:assert/strict';
import { paginateByCursor, resolvePageSize } from '../lib/server/pagination.mjs';

test('resolvePageSize enforces default and max caps', () => {
  assert.equal(resolvePageSize(undefined), 25);
  assert.equal(resolvePageSize(0), 25);
  assert.equal(resolvePageSize(5), 5);
  assert.equal(resolvePageSize(999), 100);
});

test('paginateByCursor returns first page and next cursor', () => {
  const rows = Array.from({ length: 7 }, (_, idx) => ({ id: `r${idx + 1}` }));
  const page = paginateByCursor(rows, null, 3);
  assert.deepEqual(page.items.map((row) => row.id), ['r1', 'r2', 'r3']);
  assert.equal(page.nextCursor, 'r3');
  assert.equal(page.hasMore, true);
});

test('paginateByCursor advances with cursor without overlap', () => {
  const rows = Array.from({ length: 7 }, (_, idx) => ({ id: `r${idx + 1}` }));
  const first = paginateByCursor(rows, null, 3);
  const second = paginateByCursor(rows, first.nextCursor, 3);
  assert.deepEqual(second.items.map((row) => row.id), ['r4', 'r5', 'r6']);
  assert.equal(second.nextCursor, 'r6');
});

test('paginateByCursor supports tenant-safe pre-filtered rows', () => {
  const rows = [
    { id: 'c1-1', companyId: 'c1' },
    { id: 'c1-2', companyId: 'c1' },
    { id: 'c1-3', companyId: 'c1' },
  ];
  const page = paginateByCursor(rows.filter((row) => row.companyId === 'c1'), null, 2);
  assert.deepEqual(page.items.map((row) => row.id), ['c1-1', 'c1-2']);
  assert.equal(page.nextCursor, 'c1-2');
});
