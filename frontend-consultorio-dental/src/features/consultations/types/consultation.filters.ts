import type { PaginationParams } from "@/types/pagination";

export interface ConsultationFilters extends PaginationParams {
    /** Nombre o apellido del paciente. */
    search?: string;
    patient_id?: number;
    /** Fechas de la cita, AAAA-MM-DD (zona del consultorio). */
    from?: string;
    to?: string;
}

export interface CreateConsultationDto {
    appointment_id: number;
    description: string;
    dentistObservations?: string;
}

export interface UpdateConsultationDto {
    description?: string;
    dentistObservations?: string;
}
