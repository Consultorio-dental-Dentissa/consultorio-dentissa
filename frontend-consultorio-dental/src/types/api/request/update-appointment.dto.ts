import type { StatusAppointment } from "@/types/enums/status-appointment.enum";

export interface UpdateAppointmentDto {
    scheduled_at: string;
    notes: string;
    patient_id: number;
    service_id: number;
    status: StatusAppointment;
    reason?: string;
}
