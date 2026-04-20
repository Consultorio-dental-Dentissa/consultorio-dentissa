import type { PatientResponse } from '../types/api/responses/patient.response';
import { get } from './api'

export async function requestObtenerPacientes(): Promise<PatientResponse[]> {
    return await get<PatientResponse[]>('/patients');
}

export async function requestObtenerPaciente(id: number): Promise<PatientResponse> {
    return await get<PatientResponse>(`/patients/${id}`);
}