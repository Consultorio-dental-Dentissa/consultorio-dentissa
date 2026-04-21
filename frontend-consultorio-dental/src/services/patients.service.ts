import type { PatientResponse } from '../types/api/responses/patient.response';
import { get } from './api'

export async function requestGetPatients(): Promise<PatientResponse[]> {
    return await get<PatientResponse[]>('/patients');
}

export async function requestGetPatient(id: number): Promise<PatientResponse> {
    return await get<PatientResponse>(`/patients/${id}`);
}