export const TOOTH_STATUS = {
    SANO: "SANO",
    CARIES: "CARIES",
    REMOVIDO: "REMOVIDO",
    CORONA: "CORONA",
} as const;

export type ToothStatus = (typeof TOOTH_STATUS)[keyof typeof TOOTH_STATUS];

export const TOOTH_STATUS_LIST: ToothStatus[] = [
    TOOTH_STATUS.SANO,
    TOOTH_STATUS.CARIES,
    TOOTH_STATUS.REMOVIDO,
    TOOTH_STATUS.CORONA,
];

export const MAX_TOOTH_NOTES = 300;

export interface Tooth {
    tooth_number: number;
    status: ToothStatus;
    notes: string | null;
    updated_at: Date | null;
}

export interface Odontogram {
    patient_id: number;
    teeth: Tooth[];
}

/** Numeración FDI por arcada, de izquierda a derecha del observador. */
export const UPPER_LEFT = [18, 17, 16, 15, 14, 13, 12, 11];
export const UPPER_RIGHT = [21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_LEFT = [48, 47, 46, 45, 44, 43, 42, 41];
export const LOWER_RIGHT = [31, 32, 33, 34, 35, 36, 37, 38];

/** Colores por estado: relleno, borde y color del número (con contraste suficiente). */
export const TOOTH_STATUS_STYLE: Record<ToothStatus, { label: string; fill: string; stroke: string; text: string }> = {
    SANO: { label: "Sano", fill: "#ffffff", stroke: "#9aa0a8", text: "#1f2328" },
    CARIES: { label: "Caries", fill: "#111827", stroke: "#000000", text: "#ffffff" },
    REMOVIDO: { label: "Removido", fill: "#dc2626", stroke: "#991b1b", text: "#ffffff" },
    CORONA: { label: "Corona", fill: "#e0b13a", stroke: "#a16207", text: "#1f2328" },
};
