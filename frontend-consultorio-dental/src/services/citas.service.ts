import { get, post } from './api';
import type { RespuestaCita } from '../types/api/responses/RespuestaCita';
import type { RegistrarCita } from '../types/RegistrarCita';

export async function requestObtenerCitas(): Promise<RespuestaCita[]> {
    return await get('/citas');
}

export async function requestCrearCita(cita: RegistrarCita): Promise<RespuestaCita> {
    return await post('/citas', cita);
}