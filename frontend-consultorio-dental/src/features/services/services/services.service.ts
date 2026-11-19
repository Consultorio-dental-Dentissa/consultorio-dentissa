import type { ServiceResponse } from "@/features/services/types/service.response";
import type { UpdateServiceDto } from "@/features/services/types/update-service.dto";
import type { CreateServiceDto } from "@/features/services/types/create-service.dto";
import type { Service } from "@/features/services/types/service.model";
import type { ServiceFilters } from "@/features/services/types/service.filters";
import type { Paginated } from "@/types/pagination";

import { serviceMap } from "@/features/services/types/service.mapper";
import { deleteR, get, patch, post, postForm, putForm } from "@/services/api";
import { buildQueryString, mapPaginated } from "@/utils/query";

export async function getAllServices(filters: ServiceFilters = {}): Promise<Paginated<Service>> {
    const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        search: filters.search,
    });

    const response = await get<Paginated<ServiceResponse>>(`/services${query}`);
    return mapPaginated(response.data, serviceMap);
}

export async function updateServiceStatus(id: number, status: boolean) {
    const response = await patch<unknown>(`/services/status/${id}`, { status });
    return response.data;
}

export async function updateService(id: number, dto: UpdateServiceDto): Promise<Service> {
    const response = await patch<ServiceResponse>(`/services/${id}`, dto);
    return serviceMap(response.data);
}

export async function createService(dto: CreateServiceDto): Promise<Service> {
    const response = await post<ServiceResponse>("/services", dto);
    return serviceMap(response.data);
}

/** Sube de 1 a 5 imágenes (campo multipart `images`). */
export async function uploadServiceImages(serviceId: number, files: File[]) {
    const body = new FormData();
    files.forEach((file) => body.append("images", file));
    const response = await postForm<unknown>(`/services/${serviceId}/images`, body);
    return response.data;
}

/** Reemplaza el archivo de una imagen (campo multipart `image`). */
export async function replaceServiceImage(serviceId: number, imageId: number, file: File) {
    const body = new FormData();
    body.append("image", file);
    const response = await putForm<unknown>(`/services/${serviceId}/images/${imageId}`, body);
    return response.data;
}

export async function deleteServiceImage(serviceId: number, imageId: number) {
    const response = await deleteR<unknown>(`/services/${serviceId}/images/${imageId}`);
    return response.data;
}
