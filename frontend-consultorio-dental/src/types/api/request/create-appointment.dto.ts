export interface CreateAppointmentDto {
    date: string;
    time: string;
    notes: string;
    patient_id: number;
    service_id: number;
}