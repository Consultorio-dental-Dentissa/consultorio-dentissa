import * as z from "zod";


export const CreateServiceSchema = z.object({
    name: z
        .string()
        .min(1, 'Campo obligatorio'),
    price: z
        .coerce
        .number<unknown>('El precio debe de ser un número')
        .positive('El precio debe ser mayor a cero'),
    duration_hours: z
        .coerce
        .number<unknown>('Debe ser un número')
        .min(0)
        .max(2, 'La cita solo puede durar maximo 2 horas'),
    duration_minutes: z
        .coerce
        .number<unknown>("Los minutos deben ser exclusivamente números enteros")
        .min(0),
    description: z
        .string()
        .min(1, 'Campo obligatorio'),
}).superRefine((data, ctx) => {

    const totalDuration = (data.duration_hours * 60) + (data.duration_minutes ?? 0);
    
    let error = false;
    let message: string = '';

    if (totalDuration > 120) {
        error = true;
        message = 'El tiempo total de un servicio no debe exceder las 2 horas';
    }

    if (totalDuration <= 0) {
        error = true;
        message = 'El tiempo total de un servicio debe ser mayor a 30 minutos';
    }

    if (error) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['duration_hours'],
            message: message,
        });

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['duration_minutes'],
            message: message,
        });
    }

});

// export type ServiceFormData = z.infer<typeof CreateServiceSchema>

/**
 * INDICACION:
 * Es necesario usar estos dos tipos para indicarle
 * al useForm de react-hook-form que input y output maneja
 * el resolver de zod
 */
export type ServiceInputData = z.input<typeof CreateServiceSchema>;
export type ServiceOutputData = z.output<typeof CreateServiceSchema>;