import type { ToothResponse } from "../api/responses/tooth.response";
import type { Tooth } from "../models/tooth";

export function toothMap(tooth: ToothResponse): Tooth {
    return {
        id: tooth.id,
        odontogram_id: tooth.odontogram_id,
        number: tooth.number,
        status: tooth.status,
        note: tooth.note,
        created_at: new Date(tooth.created_at),
        updated_at: new Date(tooth.updated_at),
    };
}
