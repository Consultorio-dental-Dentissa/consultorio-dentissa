import type { RespuestaCita } from "../api/responses/RespuestaCita";
import type { Appointment } from "../models/Appointment";

export function AppointmentMap(appointment: RespuestaCita): Appointment {
    return {
        id: appointment.id,
        date: new Date(appointment.date),
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