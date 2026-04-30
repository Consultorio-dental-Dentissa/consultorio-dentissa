import type { ServiceResponse } from '../types/api/responses/service.response';
import type { CreateServiceDto } from '../types/api/request/create-service.dto';
import type { Service } from '@/types/models/service';
import type { ApiResponse } from '@/types/api/responses/api.response';

import { serviceMap } from '@/types/mappers/service.mapper';
import { get, patch, post } from './api';

export async function requestGetServices(): Promise<Service[]> {
    const response = await get<ApiResponse<ServiceResponse[]>>('/services');
    const servicesResponse = response.data;
    return servicesResponse.map(service => serviceMap(service));
}

export async function requestUpdateServiceStatus(id: number, status: boolean): Promise<boolean> {
    const response =  await patch<ApiResponse<boolean>>(`/services/status/${id}`, { "status": status });
    return response.data;
}

export async function requestCreateService(createService: CreateServiceDto): Promise<Service> {
    const response = await post<ApiResponse<ServiceResponse>>('/services', createService);
    const serviceCreated = response.data;
    return serviceMap(serviceCreated);
}