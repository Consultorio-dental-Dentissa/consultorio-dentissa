export const StatusAppointment = {
    PENDIENTE: 'PENDIENTE',
    CONFIRMADA: 'CONFIRMADA',
    CANCELADA: 'CANCELADA',
    REPROGRAMADA: 'REPROGRAMADA'
} as const;

export type StatusAppointment = typeof StatusAppointment[keyof typeof StatusAppointment];