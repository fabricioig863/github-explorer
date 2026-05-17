export interface PaginatedResult<T> {
  items: T[];
  totalCount?: number;
  hasNextPage: boolean;
}
