import { useCallback, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/types/pagination";

/**
 * Estado de página para listados con paginación de servidor.
 * `resetPage` debe llamarse cuando cambie cualquier filtro.
 */
export function usePagination(limit: number = DEFAULT_PAGE_SIZE) {
    const [page, setPage] = useState(1);
    const resetPage = useCallback(() => setPage(1), []);

    return { page, limit, setPage, resetPage };
}
