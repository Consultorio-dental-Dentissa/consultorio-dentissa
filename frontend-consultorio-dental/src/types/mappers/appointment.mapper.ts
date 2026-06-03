import type { AppointmentResponse } from "../api/responses/appointment.response";
import type { Appointment } from "../models/appointment";

export function AppointmentMap(appointment: AppointmentResponse): Appointment {

    const date = new Date(appointment.date)    
    const scheduledAt = new Date(date);
    date.setMinutes(scheduledAt.getMinutes() + appointment.durationMinutes);
    const endAppointment = new Date(date);

    return {
        id: appointment.id,
        scheduled_at: scheduledAt,
        scheduled_at_end: endAppointment,
        durationMinutes: appointment.durationMinutes,
        time: appointment.time,
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