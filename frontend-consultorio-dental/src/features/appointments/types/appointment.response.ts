import type { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";

/** Elemento de GET /appointments. */
export interface AppointmentResponse {
    id: number;
    scheduled_at: string;
    durationMinutes: number;
    status: STATUS_APPOINTMENT;
    notes: string;
    created_at: string;
    /** El backend aplana el paciente en los listados (sin `user`). */
    patient: { name: string; lastname: string };
    service: { name: string };
}

/** GET /appointments/:id */
export interface AppointmentDetailResponse {
    id: number;
    scheduled_at: string;
    durationMinutes: number;
    status: STATUS_APPOINTMENT;
    notes: string;
    reason: string | null;
    cancel_reason: string | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    patient_id: number;
    service_id: number;
    patient: {
        id: number;
        user: { name: string; lastname: string };
    };
    service: { id: number; name: string; durationMinutes: number; price: string };
}
