import type { RespuestaServicio } from '../types/api/responses/RespuestaServicio';
import type { CrearServicio } from '../types/api/request/CrearServicio';
import { get, patch, post } from './api';

export async function requestObtenerServicios(): Promise<RespuestaServicio[]> {
    return await get('/services');
}

export async function requestCambiarEstadoServicio(id: number, estado: boolean): Promise<boolean> {
    return await patch(`/services/status/${id}`, { "status": estado })
}

export async function requestCrearServicio(crearServicio: CrearServicio): Promise<RespuestaServicio> {
    return await post('/services', crearServicio);
}