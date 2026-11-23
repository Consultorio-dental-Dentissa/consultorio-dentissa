import { get, put } from "@/services/api";
import { odontogramMap, toothMap } from "@/features/odontogram/types/odontogram.mapper";
import type { Odontogram, Tooth } from "@/features/odontogram/types/odontogram.model";
import type { OdontogramResponse, ToothResponse, UpdateToothDto } from "@/features/odontogram/types/odontogram.response";

export async function getOdontogram(patientId: number): Promise<Odontogram> {
    const response = await get<OdontogramResponse>(`/patients/${patientId}/odontogram`);
    return odontogramMap(response.data);
}

export async function updateTooth(patientId: number, toothNumber: number, dto: UpdateToothDto): Promise<Tooth> {
    const response = await put<ToothResponse>(`/patients/${patientId}/odontogram/${toothNumber}`, dto);
    return toothMap(response.data);
}
