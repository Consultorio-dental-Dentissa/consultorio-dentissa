import type { RespuestaPaciente } from '../types/respuestas/RespuestaPaciente';
import { get } from './api'

export async function requestObtenerPacientes(): Promise<RespuestaPaciente[]> {
    return await get<RespuestaPaciente[]>('/pacientes');
}