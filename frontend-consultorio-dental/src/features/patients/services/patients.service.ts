import { get, patch } from "@/services/api";
import { buildQueryString, mapPaginated } from "@/utils/query";
import {
    patientAppointmentHistoryMap,
    patientConsultationHistoryMap,
    patientMap,
} from "@/features/patients/types/patient.mapper";

import type {
    PatientAppointmentHistoryResponse,
    PatientConsultationHistoryResponse,
    PatientResponse,
} from "@/features/patients/types/patient.response";
import type {
    Patient,
    PatientAppointmentHistoryItem,
    PatientConsultationHistoryItem,
} from "@/features/patients/types/patient.model";
import type { PatientFilters } from "@/features/patients/types/patient.filters";
import type { UpdateMyProfileDto, UpdatePatientDto } from "@/features/patients/types/update-patient.dto";
import type { Paginated, PaginationParams } from "@/types/pagination";

export async function getAllPatients(filters: PatientFilters = {}): Promise<Paginated<Patient>> {
    const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        search: filters.search,
    });

    const response = await get<Paginated<PatientResponse>>(`/patients${query}`);
    return mapPaginated(response.data, patientMap);
}

export async function getPatientById(id: number): Promise<Patient> {
    const response = await get<PatientResponse>(`/patients/${id}`);
    return patientMap(response.data);
}

export async function getMyPatientProfile(): Promise<Patient> {
    const response = await get<PatientResponse>("/patients/me");
    return patientMap(response.data);
}

export async function updatePatient(id: number, dto: UpdatePatientDto): Promise<Patient> {
    const response = await patch<PatientResponse>(`/patients/${id}`, dto);
    return patientMap(response.data);
}

export async function updateMyProfile(dto: UpdateMyProfileDto): Promise<Patient> {
    const response = await patch<PatientResponse>("/patients/me", dto);
    return patientMap(response.data);
}

export async function getPatientAppointmentHistory(
    id: number,
    params: PaginationParams,
): Promise<Paginated<PatientAppointmentHistoryItem>> {
    const query = buildQueryString({ type: "appointments", page: params.page, limit: params.limit });
    const response = await get<Paginated<PatientAppointmentHistoryResponse>>(`/patients/${id}/history${query}`);
    return mapPaginated(response.data, patientAppointmentHistoryMap);
}

/** Solo ADMIN: el backend responde con 403 a los demás roles. */
export async function getPatientConsultationHistory(
    id: number,
    params: PaginationParams,
): Promise<Paginated<PatientConsultationHistoryItem>> {
    const query = buildQueryString({ type: "consultations", page: params.page, limit: params.limit });
    const response = await get<Paginated<PatientConsultationHistoryResponse>>(`/patients/${id}/history${query}`);
    return mapPaginated(response.data, patientConsultationHistoryMap);
}
