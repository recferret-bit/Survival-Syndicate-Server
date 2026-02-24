export interface PaginationOptions {
  page: number;
  take: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  lastPage: number;
}
