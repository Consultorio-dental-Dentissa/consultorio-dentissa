import type { PatientResponse } from '../types/api/responses/patient.response';
import type { Patient } from '@/types/models/patient';
import { patientMap } from '@/types/mappers/patient.mapper';

import { get } from './api'

export async function getAllPatients(): Promise<Patient[]> {
    const response = await get<PatientResponse[]>('/patients');
    const patients = response.data;
    return patients.map(patientRes => patientMap(patientRes));
}

export async function getPatientById(id: number): Promise<Patient> {
    const response = await get<PatientResponse>(`/patients/${id}`);
    const patientResponse = response.data;
    return patientMap(patientResponse);
}