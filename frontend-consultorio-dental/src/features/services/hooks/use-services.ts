import { getAllServices, updateServiceStatus, createService } from "@/features/services/services/services.service";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { Service } from "@/features/services/types/service.model";
import type { CreateServiceDto } from "@/features/services/types/create-service.dto";

export function useServices() {
    return useQuery({
        queryKey: ['services'],
        queryFn: () => getAllServices()
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
             * to avoid making a new GET request to the API
             */

            queryClient.setQueryData<Service[]>(['services'], prev => 
                prev?.map(service => (service.id === variables.id) ? {...service, status: variables.status} : service)
            );
        },
    });
}