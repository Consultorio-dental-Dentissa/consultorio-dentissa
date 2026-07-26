import * as z from "zod";
import { ToothStatus } from "@/types/enums/tooth-status.enum";

export const UpdateToothSchema = z.object({
    status: z.enum(ToothStatus),
    note: z
        .string()
        .max(200, 'La nota debe tener maximo 200 caracteres')
        .optional(),
});

export type UpdateToothInput = z.input<typeof UpdateToothSchema>;
export type UpdateToothOutput = z.output<typeof UpdateToothSchema>;
