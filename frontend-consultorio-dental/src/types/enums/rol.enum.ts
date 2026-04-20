export const Role = {
    ADMINISTRADOR: 'ADMINISTRADOR',
    ASISTENTE: 'ASISTENTE',
    PACIENTE: 'PACIENTE',
} as const;

export type Role = typeof Role[keyof typeof Role];