import * as z from "zod";


/* -- Schema for create a new consultation -- */

export const CreateConsultationSchema = z.object({
    notes: z
        .string()
        .min(1, 'Este campo es obligatorio')
        .max(2000, 'Las notas deben tener maximo 2000 caracteres'),
    observations: z
        .string()
        .min(1, 'Este campo es obligatorio')
        .max(200, 'Las observaciones deben tener maximo 200 caracteres'),
});

export type CreateConsultationInput = z.input<typeof CreateConsultationSchema>;
export type CreateConsultationOutput = z.output<typeof CreateConsultationSchema>;


/* -- Schema for update an existing consultation -- */

export const UpdateConsultationSchema = z.object({
    notes: z
        .string()
        .min(1, 'Este campo es obligatorio')
        .max(2000, 'Las notas deben tener maximo 2000 caracteres'),
    observations: z
        .string()
        .min(1, 'Este campo es obligatorio')
        .max(200, 'Las observaciones deben tener maximo 200 caracteres'),
});

export type UpdateConsultationInput = z.input<typeof UpdateConsultationSchema>;
export type UpdateConsultationOutput = z.output<typeof UpdateConsultationSchema>;
