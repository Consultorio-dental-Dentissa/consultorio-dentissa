import type { Paginated } from '@/types/pagination';

type QueryValue = string | number | boolean | null | undefined;

/** Valores que significan "sin filtro" en los selects de la UI. */
const NO_FILTER = new Set(['', 'TODOS', 'ALL']);

/**
 * Arma el query string omitiendo vacíos, `undefined`, `null` y "TODOS".
 * Devuelve '' o '?a=b&c=d' listo para concatenar a la URL.
 */
export function buildQueryString(params: Record<string, QueryValue>): string {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        const text = String(value).trim();
        if (NO_FILTER.has(text)) continue;
        search.set(key, text);
    }

    const query = search.toString();
    return query ? `?${query}` : '';
}

/** Aplica un mapper a cada elemento conservando la metadata de paginación. */
export function mapPaginated<TIn, TOut>(
    data: Paginated<TIn>,
    mapper: (item: TIn) => TOut,
): Paginated<TOut> {
    return {
        items: data.items.map(mapper),
        total: data.total,
        page: data.page,
        limit: data.limit,
    };
}

export function totalPages(total: number, limit: number): number {
    return Math.max(1, Math.ceil(total / Math.max(1, limit)));
}
