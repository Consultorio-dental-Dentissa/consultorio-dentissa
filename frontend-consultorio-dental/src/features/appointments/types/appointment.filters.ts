import type { PaginationParams } from "@/types/pagination";

/**
 * Filtros de GET /appointments. `from`/`to` son días AAAA-MM-DD de la zona del
 * consultorio (ambos inclusive); `sort` ordena por fecha de la cita.
 */
export interface AppointmentFilters extends PaginationParams {
    patient_id?: number;
    status?: string;
    search?: string;
    from?: string;
    to?: string;
    sort?: "asc" | "desc";
    /** Solo ADMIN y solo con status COMPLETADA: citas que aún no tienen consulta. */
    completed_without_consultation?: boolean;
}
