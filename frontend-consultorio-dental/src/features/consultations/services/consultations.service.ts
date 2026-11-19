import { deleteR, get, getBlob, patch, post, postForm } from "@/services/api";
import { buildQueryString, mapPaginated } from "@/utils/query";
import { consultationMap } from "@/features/consultations/types/consultation.mapper";
import type { Consultation } from "@/features/consultations/types/consultation.model";
import type { ConsultationResponse } from "@/features/consultations/types/consultation.response";
import type {
    ConsultationFilters,
    CreateConsultationDto,
    UpdateConsultationDto,
} from "@/features/consultations/types/consultation.filters";
import type { Paginated } from "@/types/pagination";

export async function getAllConsultations(filters: ConsultationFilters = {}): Promise<Paginated<Consultation>> {
    const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        patient_id: filters.patient_id,
        from: filters.from,
        to: filters.to,
    });

    const response = await get<Paginated<ConsultationResponse>>(`/consultations${query}`);
    return mapPaginated(response.data, consultationMap);
}

export async function getConsultationById(id: number): Promise<Consultation> {
    const response = await get<ConsultationResponse>(`/consultations/${id}`);
    return consultationMap(response.data);
}

export async function createConsultation(dto: CreateConsultationDto): Promise<Consultation> {
    const response = await post<ConsultationResponse>("/consultations", dto);
    return consultationMap(response.data);
}

export async function updateConsultation(id: number, dto: UpdateConsultationDto): Promise<Consultation> {
    const response = await patch<ConsultationResponse>(`/consultations/${id}`, dto);
    return consultationMap(response.data);
}

/** Sube de 1 a 5 imágenes (campo multipart `images`). */
export async function uploadConsultationImages(consultationId: number, files: File[]) {
    const body = new FormData();
    files.forEach((file) => body.append("images", file));
    const response = await postForm<unknown>(`/consultations/${consultationId}/images`, body);
    return response.data;
}

export async function deleteConsultationImage(consultationId: number, imageId: number) {
    const response = await deleteR<unknown>(`/consultations/${consultationId}/images/${imageId}`);
    return response.data;
}

/** Imagen clínica privada: se descarga con las credenciales de la sesión. */
export function fetchConsultationImage(path: string): Promise<Blob> {
    return getBlob(path);
}
