import type { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";

export interface Appointment {
    id: number;
    scheduled_at: Date;
    scheduled_at_end: Date;
    durationMinutes: number;
    status: STATUS_APPOINTMENT;
    created_at: Date;
    notes: string;
    patient: {
        name: string;
        lastname: string;
    };
    service: {
        name: string;
    };
}

export interface AppointmentDetail extends Appointment {
    reason: string | null;
    cancel_reason: string | null;
    cancelled_at: Date | null;
    patient_id: number;
    service_id: number;
    service_price: string;
}
