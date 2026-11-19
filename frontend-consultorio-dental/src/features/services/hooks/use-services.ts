import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
    createService,
    deleteServiceImage,
    getAllServices,
    replaceServiceImage,
    updateService,
    updateServiceStatus,
    uploadServiceImages,
} from "@/features/services/services/services.service";
import type { CreateServiceDto } from "@/features/services/types/create-service.dto";
import type { UpdateServiceDto } from "@/features/services/types/update-service.dto";
import type { ServiceFilters } from "@/features/services/types/service.filters";

export function useServices(filters?: ServiceFilters, enabled = true) {
    return useQuery({
        queryKey: ["services", "list", filters],
        queryFn: () => getAllServices(filters),
        enabled,
        placeholderData: keepPreviousData,
    });
}

/** Servicios activos para formularios (selects) y la web pública. `total` es el conteo real de la API. */
export function useActiveServices() {
    const query = useQuery({
        queryKey: ["services", "active"],
        queryFn: () => getAllServices({ limit: 100, status: "ACTIVO" }),
    });

    return { ...query, data: query.data?.items, total: query.data?.total };
}

/** Los servicios alimentan el panel, el sitio público y la auditoría además de su propio listado. */
function invalidateServiceViews(queryClient: QueryClient) {
    return () => {
        queryClient.invalidateQueries({ queryKey: ["services"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["public"] });
        queryClient.invalidateQueries({ queryKey: ["audit"] });
    };
}

export function useCreateService() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateServiceDto) => createService(dto),
        onSuccess: invalidateServiceViews(queryClient),
    });
}

export function useUpdateService(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpdateServiceDto) => updateService(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
            // Las citas muestran nombre y duración del servicio; el sitio público lo lista
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["public"] });
            queryClient.invalidateQueries({ queryKey: ["audit"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
}

export function useUpdateServiceStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: boolean }) => updateServiceStatus(id, status),
        onSuccess: invalidateServiceViews(queryClient),
    });
}

export function useUploadServiceImages(serviceId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (files: File[]) => uploadServiceImages(serviceId, files),
        onSuccess: invalidateServiceViews(queryClient),
    });
}

export function useReplaceServiceImage(serviceId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ imageId, file }: { imageId: number; file: File }) =>
            replaceServiceImage(serviceId, imageId, file),
        onSuccess: invalidateServiceViews(queryClient),
    });
}

export function useDeleteServiceImage(serviceId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (imageId: number) => deleteServiceImage(serviceId, imageId),
        onSuccess: invalidateServiceViews(queryClient),
    });
}
