export const Rol = {
    ADMINISTRADOR: 'ADMINISTRADOR',
    ASISTENTE: 'ASISTENTE',
    PACIENTE: 'PACIENTE',
} as const;

export type Rol = typeof Rol[keyof typeof Rol];