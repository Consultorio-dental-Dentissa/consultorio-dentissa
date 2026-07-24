import * as z from "zod";


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