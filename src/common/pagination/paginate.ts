export type PaginatedResult<T> = {
  data: T[];
  nextCursor: number | null;
};

export function paginate<T extends { id: number }>(items: T[], limit: number): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;

  return {
    data,
    nextCursor: hasMore ? data[data.length - 1].id : null,
  };
}
