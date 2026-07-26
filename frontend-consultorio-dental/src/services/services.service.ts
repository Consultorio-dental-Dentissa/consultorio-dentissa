import type { ServiceResponse } from '../types/api/responses/service.response';
import type { CreateServiceDto } from '../types/api/request/create-service.dto';
import type { Service } from '@/types/models/service';

import { serviceMap } from '@/types/mappers/service.mapper';
import { get, patch, post } from './api';

export async function getAllServices(): Promise<Service[]> {
    const response = await get<ServiceResponse[]>('/services');
    const servicesResponse = response.data;
    return servicesResponse.map(service => serviceMap(service));
}

export async function updateServiceStatus(id: number, status: boolean): Promise<boolean> {
    const response =  await patch<boolean>(`/services/status/${id}`, { "status": status });
    return response.data;
}

export async function createService(createService: CreateServiceDto): Promise<Service> {
    const response = await post<ServiceResponse>('/services', createService);
    const serviceCreated = response.data;
    return serviceMap(serviceCreated);
}