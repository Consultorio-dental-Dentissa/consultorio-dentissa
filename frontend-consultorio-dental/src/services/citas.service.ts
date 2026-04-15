import { get, post } from './api';
import type { RespuestaCita } from '../types/api/responses/RespuestaCita';
import type { CrearCita } from '../types/api/request/CrearCita';

export async function requestObtenerCitas(): Promise<RespuestaCita[]> {
    return await get('/citas');
}

export async function requestCrearCita(cita: CrearCita): Promise<RespuestaCita> {
    return await post('/citas', cita);
}