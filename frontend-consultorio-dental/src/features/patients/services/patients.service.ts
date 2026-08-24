import type { PatientResponse } from '@/features/patients/types/patient.response';
import type { Patient } from '@/features/patients/types/patient.model';
import type { PatientFilters } from '@/features/patients/types/patient.filters';
import { patientMap } from '@/features/patients/types/patient.mapper';

import { get } from '@/services/api'

export async function getAllPatients(filters?: PatientFilters): Promise<Patient[]> {

    const params = new URLSearchParams();

    if (filters?.status && filters.status !== 'TODOS') params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/patients?${queryString}` : '/patients';

    const response = await get<PatientResponse[]>(url);
    const patients = response.data;
    return patients.map(patientRes => patientMap(patientRes));
}

export async function getPatientById(id: number): Promise<Patient> {
    const response = await get<PatientResponse>(`/patients/${id}`);
    const patientResponse = response.data;
    return patientMap(patientResponse);
}