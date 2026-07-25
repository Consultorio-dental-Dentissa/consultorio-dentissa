import { get, post, put } from './api';
import { consultationMap } from '@/types/mappers/consultation.mapper';

import type { ConsultationResponse } from '../types/api/responses/consultation.response';
import type { CreateConsultationDto } from '../types/api/request/create-consultation.dto';
import type { UpdateConsultationDto } from '../types/api/request/update-consultation.dto';
import type { Consultation } from '@/types/models/consultation';

export async function getAllConsultations(): Promise<Consultation[]> {
    const response = await get<ConsultationResponse[]>('/consultations');
    const consultationsResponse = response.data;
    return consultationsResponse.map(consultation => consultationMap(consultation));
}

export async function createConsultation(consultation: CreateConsultationDto): Promise<Consultation> {
    const response = await post<ConsultationResponse>('/consultations', consultation);
    const consultationCreated = response.data;
    return consultationMap(consultationCreated);
}

export async function updateConsultation(id: number, consultation: UpdateConsultationDto): Promise<Consultation> {
    const response = await put<ConsultationResponse>(`/consultations/${id}`, consultation);
    const consultationUpdated = response.data;
    return consultationMap(consultationUpdated);
}
