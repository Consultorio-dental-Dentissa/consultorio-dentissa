import type { ToothResponse } from "./tooth.response";

export interface OdontogramResponse {
    id: number;
    patient_id: number;
    created_at: string;
    updated_at: string;
    teeth: ToothResponse[];
}
