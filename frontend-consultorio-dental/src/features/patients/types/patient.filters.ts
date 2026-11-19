import type { PaginationParams } from "@/types/pagination";

export interface PatientFilters extends PaginationParams {
    /** ACTIVO | INACTIVO (o TODOS / vacío para no filtrar). */
    status?: string;
    search?: string;
}
