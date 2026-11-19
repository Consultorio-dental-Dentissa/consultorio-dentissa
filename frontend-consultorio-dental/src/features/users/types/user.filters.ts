import type { PaginationParams } from "@/types/pagination";

export interface UserFilters extends PaginationParams {
    role?: string;
    /** ACTIVO | INACTIVO (o TODOS / vacío para no filtrar). */
    status?: string;
    search?: string;
}
