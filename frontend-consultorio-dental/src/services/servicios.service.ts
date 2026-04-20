import type { ServiceResponse } from '../types/api/responses/service.response';
import type { CreateServiceDto } from '../types/api/request/create-service.dto';
import { get, patch, post } from './api';

export async function requestObtenerServicios(): Promise<ServiceResponse[]> {
    return await get('/services');
}

export async function requestCambiarEstadoServicio(id: number, estado: boolean): Promise<boolean> {
    return await patch(`/services/status/${id}`, { "status": estado })
}

export async function requestCrearServicio(crearServicio: CreateServiceDto): Promise<ServiceResponse> {
    return await post('/services', crearServicio);
}