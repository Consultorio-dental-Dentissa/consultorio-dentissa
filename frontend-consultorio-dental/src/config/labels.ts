import { Role } from "@/features/users/types/rol.enum";

export const ROLE_LABELS: Record<string, string> = {
    [Role.ADMINISTRADOR]: "Administrador",
    [Role.ASISTENTE]: "Asistente",
    [Role.PACIENTE]: "Paciente",
};
