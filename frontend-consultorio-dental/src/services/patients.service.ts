import type { PatientResponse } from '../types/api/responses/patient.response';
import type { Patient } from '@/types/models/patient';
import { patientMap } from '@/types/mappers/patient.mapper';

import { get } from './api'

export async function requestGetPatients(): Promise<Patient[]> {
    const patientsResponse = await get<PatientResponse[]>('/patients');
    return patientsResponse.map(patientRes => patientMap(patientRes));
}

export async function requestGetPatient(id: number): Promise<Patient> {
    const patientResponse = await get<PatientResponse>(`/patients/${id}`);
    return patientMap(patientResponse);
}