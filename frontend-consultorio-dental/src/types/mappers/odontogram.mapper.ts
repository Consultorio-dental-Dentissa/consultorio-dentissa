import type { OdontogramResponse } from "../api/responses/odontogram.response";
import type { Odontogram } from "../models/odontogram";
import { toothMap } from "./tooth.mapper";

export function odontogramMap(odontogram: OdontogramResponse): Odontogram {
    return {
        id: odontogram.id,
        patient_id: odontogram.patient_id,
        created_at: new Date(odontogram.created_at),
        updated_at: new Date(odontogram.updated_at),
        teeth: odontogram.teeth.map(tooth => toothMap(tooth)),
    };
}
