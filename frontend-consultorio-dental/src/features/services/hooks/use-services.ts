import { getAllServices, updateServiceStatus, createService } from "@/features/services/services/services.service";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { Service } from "@/features/services/types/service.model";
import type { CreateServiceDto } from "@/features/services/types/create-service.dto";
import type { ServiceFilters } from "@/features/services/types/service.filters";

export function useServices(filters?: ServiceFilters) {
    return useQuery({
        queryKey: ['services', filters],
        queryFn: () => getAllServices(filters)
    });
}

export function useCreateService() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newAppointment: CreateServiceDto) => createService(newAppointment),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] })
    });
}

export function useUpdateServiceStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number, status: boolean }) => updateServiceStatus(id, status),
        onSuccess: (success, variables) => {

            /**
             * Update the status of the service status
             * to avoid making a new GET request to the API.
             * Uses setQueriesData (plural, partial key match) instead
             * of setQueryData so every cached filter combination for
             * ['services', ...] gets updated, not just the unfiltered one.
             */

            queryClient.setQueriesData<Service[]>(
                { queryKey: ['services'] },
                prev => prev?.map(service => (service.id === variables.id) ? {...service, status: variables.status} : service)
            );
        },
    });
}