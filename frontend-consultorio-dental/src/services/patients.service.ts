import type { PatientResponse } from '../types/api/responses/patient.response';
import type { Patient } from '@/types/models/patient';
import type { ApiResponse } from '@/types/api/responses/api.response';
import { patientMap } from '@/types/mappers/patient.mapper';

import { get } from './api'

export async function requestGetPatients(): Promise<Patient[]> {
    const response = await get<ApiResponse<PatientResponse[]>>('/patients');
    const patients = response.data;
    return patients.map(patientRes => patientMap(patientRes));
}

export async function requestGetPatient(id: number): Promise<Patient> {
    const response = await get<ApiResponse<PatientResponse>>(`/patients/${id}`);
    const patientResponse = response.data;
    return patientMap(patientResponse);
}