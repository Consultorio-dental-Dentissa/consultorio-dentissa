import type { Odontogram, Tooth } from "@/features/odontogram/types/odontogram.model";
import type { OdontogramResponse, ToothResponse } from "@/features/odontogram/types/odontogram.response";

export function toothMap(tooth: ToothResponse): Tooth {
    return {
        tooth_number: tooth.tooth_number,
        status: tooth.status,
        notes: tooth.notes,
        updated_at: tooth.updated_at ? new Date(tooth.updated_at) : null,
    };
}

export function odontogramMap(response: OdontogramResponse): Odontogram {
    return { patient_id: response.patient_id, teeth: response.teeth.map(toothMap) };
}
