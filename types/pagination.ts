export type PageCursor = string | null;

export type PageRequest = {
  pageSize?: number;
  cursor?: PageCursor;
};

export type PageResult<T> = {
  items: T[];
  nextCursor: PageCursor;
  hasMore: boolean;
  pageSize: number;
};
