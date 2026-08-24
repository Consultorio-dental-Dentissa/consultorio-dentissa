import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createAppointment, getAllAppointments } from "@/features/appointments/services/appointments.service";
import type { CreateAppointmentDto } from "@/features/appointments/types/create-appointment.dto";
import type { AppointmentFilters } from "../types/appointment.filters";

export function useAppointments(filters?: AppointmentFilters) {
    return useQuery({
        queryKey: ['appointments', filters],
        queryFn: () => getAllAppointments(filters)
    })
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newAppointment: CreateAppointmentDto) => createAppointment(newAppointment),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] })
    });
}