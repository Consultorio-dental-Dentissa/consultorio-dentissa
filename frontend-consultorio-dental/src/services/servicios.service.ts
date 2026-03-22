import type { RegistrarServicio } from '../types/RegistrarServicio';
import type { RespuestaServicio } from '../types/respuestas/RespuestaServicio';
import { get, patch, post } from './api';

export async function requestObtenerServicios(): Promise<RespuestaServicio[]> {
    return await get('/servicios');
}

export async function requestCambiarEstadoServicio(id: number, estado: boolean): Promise<boolean> {
    return await patch(`/servicios/${id}/estado`, {estado})
}

export async function requestCrearServicio(registrarServicio: RegistrarServicio): Promise<RespuestaServicio> {
    return await post('/servicios', registrarServicio);
}