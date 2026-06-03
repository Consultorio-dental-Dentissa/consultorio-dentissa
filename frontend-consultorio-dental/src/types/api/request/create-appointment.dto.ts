export interface CreateAppointmentDto {
    scheduled_at: string;
    notes: string;
    patient_id: number;
    service_id: number;
}