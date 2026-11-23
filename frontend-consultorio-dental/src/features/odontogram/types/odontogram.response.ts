import type { ToothStatus } from "@/features/odontogram/types/odontogram.model";

export interface ToothResponse {
    tooth_number: number;
    status: ToothStatus;
    notes: string | null;
    updated_at: string | null;
}

/** GET /patients/:id/odontogram */
export interface OdontogramResponse {
    patient_id: number;
    teeth: ToothResponse[];
}

/** Cuerpo de PUT /patients/:id/odontogram/:tooth */
export interface UpdateToothDto {
    status: ToothStatus;
    notes?: string;
}
