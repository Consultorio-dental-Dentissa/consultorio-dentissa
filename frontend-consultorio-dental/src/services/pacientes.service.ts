import type { RespuestaPaciente } from '../types/api/responses/RespuestaPaciente';
import { get } from './api'

export async function requestObtenerPacientes(): Promise<RespuestaPaciente[]> {
    return await get<RespuestaPaciente[]>('/patients');
}

export async function requestObtenerPaciente(id: number): Promise<RespuestaPaciente> {
    return await get<RespuestaPaciente>(`/patients/${id}`);
}