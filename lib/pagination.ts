import type { PageCursor, PageRequest, PageResult } from '../types/pagination';

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export function resolvePageSize(request?: PageRequest): number {
  const raw = typeof request?.pageSize === 'number' ? Math.trunc(request.pageSize) : DEFAULT_PAGE_SIZE;
  if (raw < 1) return DEFAULT_PAGE_SIZE;
  if (raw > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return raw;
}

export function normalizeCursor(value?: PageCursor): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function toPageResult<T>(items: T[], nextCursor: string | null, pageSize: number): PageResult<T> {
  return {
    items,
    nextCursor,
    hasMore: !!nextCursor,
    pageSize,
  };
}
