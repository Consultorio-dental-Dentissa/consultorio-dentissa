import { get, put } from './api';
import { odontogramMap } from '@/types/mappers/odontogram.mapper';
import { toothMap } from '@/types/mappers/tooth.mapper';

import type { OdontogramResponse } from '../types/api/responses/odontogram.response';
import type { ToothResponse } from '../types/api/responses/tooth.response';
import type { UpdateToothDto } from '../types/api/request/update-tooth.dto';
import type { Odontogram } from '@/types/models/odontogram';
import type { Tooth } from '@/types/models/tooth';

export async function getOdontogramByPatientId(patientId: number): Promise<Odontogram> {
    const response = await get<OdontogramResponse>(`/odontograms/patient/${patientId}`);
    return odontogramMap(response.data);
}

export async function updateTooth(id: number, tooth: UpdateToothDto): Promise<Tooth> {
    const response = await put<ToothResponse>(`/odontograms/teeth/${id}`, tooth);
    return toothMap(response.data);
}
