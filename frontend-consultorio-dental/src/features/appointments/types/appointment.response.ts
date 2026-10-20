import type { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";

export interface AppointmentResponse {
    id: number;
    scheduled_at: Date;
    durationMinutes: number;
    status: STATUS_APPOINTMENT;
    notes: string;
    created_at: Date;
    patient: {
        name: string
        lastname: string
    },
    service: {
        name: string
    }
}