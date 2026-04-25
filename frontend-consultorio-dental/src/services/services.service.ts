import type { ServiceResponse } from '../types/api/responses/service.response';
import type { CreateServiceDto } from '../types/api/request/create-service.dto';
import type { Service } from '@/types/models/service';

import { serviceMap } from '@/types/mappers/service.mapper';
import { get, patch, post } from './api';

export async function requestGetServices(): Promise<Service[]> {
    const servicesResponse = await get<ServiceResponse[]>('/services');
    return servicesResponse.map(service => serviceMap(service));
}

export async function requestUpdateServiceStatus(id: number, status: boolean): Promise<boolean> {
    return await patch(`/services/status/${id}`, { "status": status })
}

export async function requestCreateService(createService: CreateServiceDto): Promise<Service> {
    const serviceResponse = await post<ServiceResponse>('/services', createService);
    return serviceMap(serviceResponse);
}