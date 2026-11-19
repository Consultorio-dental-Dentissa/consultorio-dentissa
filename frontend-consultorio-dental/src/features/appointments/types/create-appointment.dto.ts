export interface CreateAppointmentDto {
    /** ISO 8601 (UTC) calculado a partir de la fecha y hora locales elegidas. */
    scheduled_at: string;
    notes: string;
    service_id: number;
    /** Obligatorio para ADMIN/ASISTENTE; el backend lo ignora para PACIENTE. */
    patient_id?: number;
}

export interface UpdateAppointmentDto {
    service_id?: number;
    notes?: string;
}

export interface CancelAppointmentDto {
    reason: string;
}

export interface RescheduleAppointmentDto {
    scheduled_at: string;
    reason: string;
}
