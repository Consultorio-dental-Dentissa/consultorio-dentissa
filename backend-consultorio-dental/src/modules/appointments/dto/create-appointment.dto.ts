export interface CreateAppointmentDto {
    date: string;
    time: string;
    durationMinutes: number;
    status?: string;
    notes: string;
    reason: string;
    patient_id: number;
    service_id: number;
}