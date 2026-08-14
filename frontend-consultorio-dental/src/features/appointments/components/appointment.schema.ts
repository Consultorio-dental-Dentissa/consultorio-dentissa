import * as z from "zod";


export const CreateAppointmentSchema = z.object({
    date: z
        .iso.date('Seleccione una fecha valida'),
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
}).superRefine((data, ctx) => {

    const scheduledAt = new Date(`${data.date}T${data.time}:00`);
    const now = new Date();

    if (scheduledAt <= now) {

        const isTimeError = scheduledAt.toDateString() === now.toDateString();

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: isTimeError 
                ? 'La hora debe ser posterior a la hora actual'
                : 'La fecha no puede ser anterior a la fecha actual',
            path: [isTimeError ? 'time' : 'date']
        });
    }
})

export type CreateAppointmentInput = z.input<typeof CreateAppointmentSchema>;
export type CreateAppointmentOutput = z.output<typeof CreateAppointmentSchema>;