import type { AppointmentResponse } from "@/features/appointments/types/appointment.response";
import type { Appointment } from "@/features/appointments/types/appointment";

export function AppointmentMap(appointment: AppointmentResponse): Appointment {

    const date = new Date(appointment.scheduled_at)    
    const scheduledAt = new Date(date);
    date.setMinutes(scheduledAt.getMinutes() + appointment.durationMinutes);
    const endAppointment = new Date(date);

    return {
        id: appointment.id,
        scheduled_at: scheduledAt,
        scheduled_at_end: endAppointment,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        created_at: appointment.created_at,
        notes: appointment.notes,
        patient: {
            name: appointment.patient.name,
            lastname: appointment.patient.lastname,
        },
        service: {
            name: appointment.service.name
        }
    }
}