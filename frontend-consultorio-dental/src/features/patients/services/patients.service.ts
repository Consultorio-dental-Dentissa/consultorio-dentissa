import type { PatientResponse } from '@/features/patients/types/patient.response';
import type { Patient } from '@/features/patients/types/patient';
import type { ApiResponse } from '@/types/api.response';
import { patientMap } from '@/features/patients/types/patient.mapper';

import { get } from '@/services/api'

export async function getAllPatients(): Promise<Patient[]> {
    const response = await get<ApiResponse<PatientResponse[]>>('/patients');
    const patients = response.data;
    return patients.map(patientRes => patientMap(patientRes));
}

export async function getPatientById(id: number): Promise<Patient> {
    const response = await get<ApiResponse<PatientResponse>>(`/patients/${id}`);
    const patientResponse = response.data;
    return patientMap(patientResponse);
}