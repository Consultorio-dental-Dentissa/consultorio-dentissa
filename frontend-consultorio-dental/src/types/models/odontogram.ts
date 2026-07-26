import type { Tooth } from "./tooth";

export interface Odontogram {
    id: number;
    patient_id: number;
    created_at: Date;
    updated_at: Date;
    teeth: Tooth[];
}
