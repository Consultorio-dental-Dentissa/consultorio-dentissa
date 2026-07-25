import { StatusAppointment } from "@/types/enums/status-appointment.enum";
import * as z from "zod";


/* -- Schema for create a new appointment -- */

export const CreateAppointmentSchema = z.object({
    date: z
    .iso.date('Seleccione una fecha valida')
    .refine(date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // medianoche LOCAL de hoy

        const selected = new Date(`${date}T00:00:00`); // fuerza parseo como hora LOCAL, no UTC

        return selected >= today;
    }, 'La fecha no puede ser anterior a la fecha actual'),
    time: z
        .iso.time('Porfavor escoja un horario valido')
        .min(1, 'Este campo es obligatorio'),
    notes: z
        .string()
        .min(1, 'Este campo es obligatorio')
        .max(300, 'Las notas deben tener maximo 300 caracteres'),
    service_id: z
        .coerce.number<string>('Seleccione un servicio valido'),
    patient_id: z
        .coerce.number<string>('Seleccione un paciente valido')
});

export type CreateAppointmentInput = z.input<typeof CreateAppointmentSchema>;
export type CreateAppointmentOutput = z.output<typeof CreateAppointmentSchema>;




/* -- Schema for update an existing appointment -- */

export const UpdateAppointmentSchema = z.object({
    date: z
    .iso.date('Seleccione una fecha valida')
    /*
    .refine(date => {

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(`${date}T00:00:00`);
        
        return selected >= today;

    }, 'La fecha no puede ser anterior a la fecha actual')*/,
    time: z
        .iso.time('Porfavor escoja un horario valido')
        .min(1, 'Este campo es obligatorio'),
    notes: z
        .string()
        .min(1, 'Este campo es obligatorio')
        .max(300, 'Las notas deben tener maximo 300 caracteres'),
    service_id: z
        .coerce.number('Seleccione un servicio valido'),
    patient_id: z
        .coerce.number('Seleccione un paciente valido'),
    status: z
        .enum(StatusAppointment),
    reason: z
        .string()
        .max(200, 'El motivo debe tener maximo de 200 caracteres')
        .optional()
}).superRefine((data, ctx) => {

    const requiresReason = data.status === StatusAppointment.CANCELADA || data.status === StatusAppointment.REPROGRAMADA;

    if (requiresReason && !data.reason?.trim()) {
        ctx.addIssue({
            code: 'custom',
            message: 'Debes escribir un motivo para cambiar el estado de la cita',
            path: ['reason'],
        });
    }
});

export type UpdateAppointmentInput = z.input<typeof UpdateAppointmentSchema>;
export type UpdateAppointmentOutput = z.output<typeof UpdateAppointmentSchema>;