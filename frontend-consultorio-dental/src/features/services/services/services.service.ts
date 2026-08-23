import type { ServiceResponse } from '@/features/services/types/service.response';
import type { CreateServiceDto } from '@/features/services/types/create-service.dto';
import type { Service } from '@/features/services/types/service.model';

import { serviceMap } from '@/features/services/types/service.mapper';
import { get, patch, post } from '@/services/api';

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