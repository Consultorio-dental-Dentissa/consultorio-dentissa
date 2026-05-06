import * as z from "zod";
import { Role } from "@/types/enums/rol.enum";


export const createUserSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es obligatorio'),
    lastname: z
        .string()
        .min(1, 'El apellido es obligatorio'),
    email: z
        .string()
        .min(1, 'El correo es obligatorio')
        .email('El correo no es válido. Usa un formato de nombre@dominio.com'),
    phone: z
        .string()
        .min(10, 'El teléfono debe tener al menos 10 caracteres'),
    password: z
        .string()
        .min(8, 'La contraseña debe tener mínimo 8 caracteres'),
    role: z
        .enum([Role.ADMINISTRADOR, Role.ASISTENTE, Role.PACIENTE], ({
            message: "Debes seleccionar un rol valido"
        })),
    patient: z.object({
        address: z
            .string()
            .min(1, 'La dirección es obligatoria'),
        emergency_phone: z
            .string()
            .min(10, 'El teléfono de emergencia debe tener al menos 10 caracteres'),
        birth_date: z
            .iso
            .date('Por favor escoja una fecha de nacimiento')
    }).optional()

}).superRefine((data, ctx) => {

    /**
     * INDICACION:
     * Aqui se realizan algunas validaciones
     * extra de los campos de los formularios
     */

    /* Validamos que los telefonos 
    solo tengan números */
    if (data.phone) {

        const phone = data.phone;
        const isPhoneNumeric = /^[0-9]+$/.test(phone);

        if (!isPhoneNumeric) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['phone'],
                message: 'El telefono solo puede contener numeros'
            })
        }
    }

    if (data.patient?.emergency_phone) {

        const emergencyPhone = data.patient?.emergency_phone ?? "";
        const isEmergencyPhoneNumeric = /^[0-9]+$/.test(emergencyPhone);

        if (!isEmergencyPhoneNumeric) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['patient', 'emergency_phone'],
                message: 'El telefono de emergencia solo puede contener numeros'
            })
        }
    }

    /* Validamos que la fecha de nacimiento no 
    sea posterior a la fecha actual */
    if (data.patient?.birth_date) {

        const date = new Date(data.patient.birth_date);
        const today = new Date();

        if (date > today) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['patient', 'birth_date'],
                message: 'La fecha de nacimiento no puede ser posterior al dia de hoy'
            })
        }

    }

    /* Validamos, por seguridad, que el formulario 
    con rol de PACIENTE no se envie sin sus datos */
    if (data.role === Role.PACIENTE && !data.patient) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['patient'],
            message: "Los datos del paciente son obligatorios",
        });
    }
});

export type UserFormData = z.infer<typeof createUserSchema>