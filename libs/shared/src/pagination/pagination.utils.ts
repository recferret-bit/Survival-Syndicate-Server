import type { PaginationOptions } from './pagination.types';

export function getSkip(pagination: PaginationOptions): number {
  return (pagination.page - 1) * pagination.take;
}
