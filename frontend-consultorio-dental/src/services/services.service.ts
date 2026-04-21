import type { ServiceResponse } from '../types/api/responses/service.response';
import type { CreateServiceDto } from '../types/api/request/create-service.dto';
import { get, patch, post } from './api';

export async function requestGetServices(): Promise<ServiceResponse[]> {
    return await get('/services');
}

export async function requestUpdateServiceStatus(id: number, status: boolean): Promise<boolean> {
    return await patch(`/services/status/${id}`, { "status": status })
}

export async function requestCreateService(createService: CreateServiceDto): Promise<ServiceResponse> {
    return await post('/services', createService);
}