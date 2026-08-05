export const StatusAppointment = {
    PENDIENTE: 'PENDIENTE',
    CONFIRMADA: 'CONFIRMADA',
    CANCELADA: 'CANCELADA',
    REPROGRAMADA: 'REPROGRAMADA',
    COMPLETADA: 'COMPLETADA'
} as const;

export type StatusAppointment = typeof StatusAppointment[keyof typeof StatusAppointment];