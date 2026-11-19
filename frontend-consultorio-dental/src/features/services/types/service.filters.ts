import type { PaginationParams } from "@/types/pagination";

export interface ServiceFilters extends PaginationParams {
    /** ACTIVO | INACTIVO (solo lo respeta el ADMIN; el resto siempre ve activos). */
    status?: string;
    search?: string;
}
