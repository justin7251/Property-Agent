export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export function resolvePageSize(input) {
  const raw = typeof input === 'number' ? Math.trunc(input) : DEFAULT_PAGE_SIZE;
  if (raw < 1) return DEFAULT_PAGE_SIZE;
  if (raw > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return raw;
}

export function paginateByCursor(rows, cursor, pageSize) {
  const size = resolvePageSize(pageSize);
  const startIndex = cursor ? rows.findIndex((row) => row.id === cursor) + 1 : 0;
  const slice = rows.slice(Math.max(startIndex, 0), Math.max(startIndex, 0) + size + 1);
  const hasMore = slice.length > size;
  const items = hasMore ? slice.slice(0, size) : slice;
  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id || null : null,
    hasMore,
    pageSize: size,
  };
}
