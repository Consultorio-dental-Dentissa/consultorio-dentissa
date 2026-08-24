import type { ServiceResponse } from '@/features/services/types/service.response';
import type { CreateServiceDto } from '@/features/services/types/create-service.dto';
import type { Service } from '@/features/services/types/service.model';
import type { ServiceFilters } from '@/features/services/types/service.filters';

import { serviceMap } from '@/features/services/types/service.mapper';
import { get, patch, post } from '@/services/api';

export async function getAllServices(filters?: ServiceFilters): Promise<Service[]> {

    const params = new URLSearchParams();

    if (filters?.status && filters.status !== 'TODOS') params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/services?${queryString}` : '/services';

    const response = await get<ServiceResponse[]>(url);
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