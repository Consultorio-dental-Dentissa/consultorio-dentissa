import type { StatusAppointment } from "@/types/enums/status-appointment.enum";

export interface AppointmentResponse {
    id: number;
    scheduled_at: Date;
    durationMinutes: number;
    status: StatusAppointment;
    notes: string;
    created_at: Date;
    patient_id: number;
    service_id: number;
    patient: {
        name: string
        lastname: string
    },
    service: {
        name: string
    }
}