import type { StatusAppointment } from "../enums/status-appointment.enum";

export interface Appointment {
    id: number;
    scheduled_at: Date;
    scheduled_at_end: Date;
    durationMinutes: number;
    status: StatusAppointment;
    created_at: Date;
    notes: string;
    patient: {
        name: string
        lastname: string
    },
    service: {
        name: string
    }
}