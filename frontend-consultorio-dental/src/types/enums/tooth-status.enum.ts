export const ToothStatus = {
    SANO: 'SANO',
    CARIES: 'CARIES',
    OBTURADO: 'OBTURADO',
    AUSENTE: 'AUSENTE',
    EXTRAIDO: 'EXTRAIDO',
    CORONA: 'CORONA',
    IMPLANTE: 'IMPLANTE'
} as const;

export type ToothStatus = typeof ToothStatus[keyof typeof ToothStatus];
