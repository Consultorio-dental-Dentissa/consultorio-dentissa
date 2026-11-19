/** Forma de los listados del backend: `{ items, total, page, limit }`. */
export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export const DEFAULT_PAGE_SIZE = 10;
