import * as z from "zod";
import { Role } from "@/features/users/types/rol.enum";
import {
    birthDateSchema, emailSchema, passwordSchema, phoneSchema, requiredText,
} from "@/utils/validation";

export const createUserSchema = z
    .object({
        name: requiredText("El nombre"),
        lastname: requiredText("El apellido"),
        email: emailSchema,
        phone: phoneSchema("El teléfono"),
        password: passwordSchema,
        role: z.enum([Role.ADMINISTRADOR, Role.ASISTENTE, Role.PACIENTE], {
            message: "Selecciona un rol",
        }),
        address: z.string().trim().max(300).optional(),
        birth_date: z.string().optional(),
        emergency_phone: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.role !== Role.PACIENTE) return;

        if (!data.address) {
            ctx.addIssue({ code: "custom", path: ["address"], message: "La dirección es obligatoria" });
        }

        const birth = birthDateSchema.safeParse(data.birth_date ?? "");
        if (!birth.success) {
            ctx.addIssue({ code: "custom", path: ["birth_date"], message: birth.error.issues[0].message });
        }

        const emergency = phoneSchema("El teléfono de emergencia").safeParse(data.emergency_phone ?? "");
        if (!emergency.success) {
            ctx.addIssue({ code: "custom", path: ["emergency_phone"], message: emergency.error.issues[0].message });
        }
    });

export type UserFormData = z.infer<typeof createUserSchema>;
