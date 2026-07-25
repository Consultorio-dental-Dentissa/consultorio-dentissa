import type { PatientResponse } from '../types/api/responses/patient.response';
import type { Patient } from '@/types/models/patient';
import { patientMap } from '@/types/mappers/patient.mapper';

import { get } from './api'

export async function getAllPatients(parameters?: string): Promise<Patient[]> {
    const url = parameters ? `/patients?${parameters}` : '/patients';
    const response = await get<PatientResponse[]>(url);
    const patients = response.data;
    return patients.map(patientRes => patientMap(patientRes));
}

export async function getPatientsCount(parameters?: string): Promise<number> {
    const url = parameters ? `/patients/count?${parameters}` : '/patients/count';
    const response = await get<number>(url);
    return response.data;
}

export async function getPatientById(id: number): Promise<Patient> {
    const response = await get<PatientResponse>(`/patients/${id}`);
    const patientResponse = response.data;
    return patientMap(patientResponse);
}