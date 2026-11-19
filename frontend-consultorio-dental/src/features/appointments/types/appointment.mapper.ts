import type {
    AppointmentDetailResponse,
    AppointmentResponse,
} from "@/features/appointments/types/appointment.response";
import type { Appointment, AppointmentDetail } from "@/features/appointments/types/appointment.model";

export function appointmentMap(appointment: AppointmentResponse): Appointment {
    const start = new Date(appointment.scheduled_at);

    return {
        id: appointment.id,
        scheduled_at: start,
        scheduled_at_end: new Date(start.getTime() + appointment.durationMinutes * 60_000),
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        created_at: new Date(appointment.created_at),
        notes: appointment.notes,
        patient: {
            name: appointment.patient.name,
            lastname: appointment.patient.lastname,
        },
        service: { name: appointment.service.name },
    };
}

export function appointmentDetailMap(detail: AppointmentDetailResponse): AppointmentDetail {
    const start = new Date(detail.scheduled_at);

    return {
        id: detail.id,
        scheduled_at: start,
        scheduled_at_end: new Date(start.getTime() + detail.durationMinutes * 60_000),
        durationMinutes: detail.durationMinutes,
        status: detail.status,
        created_at: new Date(detail.created_at),
        notes: detail.notes,
        reason: detail.reason,
        cancel_reason: detail.cancel_reason,
        cancelled_at: detail.cancelled_at ? new Date(detail.cancelled_at) : null,
        patient_id: detail.patient_id,
        service_id: detail.service_id,
        service_price: detail.service.price,
        patient: {
            name: detail.patient.user.name,
            lastname: detail.patient.user.lastname,
        },
        service: { name: detail.service.name },
    };
}
