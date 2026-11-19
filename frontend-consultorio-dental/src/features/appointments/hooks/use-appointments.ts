import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cancelAppointment,
    completeAppointment,
    confirmAppointment,
    createAppointment,
    getAllAppointments,
    getAppointmentsInRange,
    getAppointmentById,
    rescheduleAppointment,
    updateAppointment,
} from "@/features/appointments/services/appointments.service";
import type { AppointmentFilters } from "@/features/appointments/types/appointment.filters";
import type {
    CancelAppointmentDto,
    CreateAppointmentDto,
    RescheduleAppointmentDto,
    UpdateAppointmentDto,
} from "@/features/appointments/types/create-appointment.dto";

export function useAppointments(filters?: AppointmentFilters, enabled = true) {
    return useQuery({
        queryKey: ["appointments", "list", filters],
        queryFn: () => getAllAppointments(filters),
        placeholderData: keepPreviousData,
        enabled,
    });
}

/** Citas de un rango de días para el calendario (recarga al navegar o tras mutaciones). */
export function useAppointmentsRange(
    from: string,
    to: string,
    filters?: Pick<AppointmentFilters, "status" | "search">,
    enabled = true,
) {
    return useQuery({
        queryKey: ["appointments", "range", from, to, filters],
        queryFn: () => getAppointmentsInRange(from, to, filters),
        placeholderData: keepPreviousData,
        enabled,
    });
}

export function useAppointment(id: number | null) {
    return useQuery({
        queryKey: ["appointments", "detail", id],
        queryFn: () => getAppointmentById(id as number),
        enabled: id !== null,
    });
}

/**
 * Toda mutación de citas invalida los listados de citas y el historial del
 * paciente; las notificaciones y estadísticas dependen de ellas.
 */
function useInvalidateAppointments() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        // Listado, ficha y resumen (próxima cita / última visita) del paciente dependen de sus citas
        queryClient.invalidateQueries({ queryKey: ["patients"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["audit"] });
    };
}

export function useCreateAppointment() {
    const invalidate = useInvalidateAppointments();
    return useMutation({
        mutationFn: (dto: CreateAppointmentDto) => createAppointment(dto),
        onSuccess: invalidate,
    });
}

export function useUpdateAppointment() {
    const invalidate = useInvalidateAppointments();
    return useMutation({
        mutationFn: ({ id, ...dto }: UpdateAppointmentDto & { id: number }) => updateAppointment(id, dto),
        onSuccess: invalidate,
    });
}

export function useConfirmAppointment() {
    const invalidate = useInvalidateAppointments();
    return useMutation({
        mutationFn: (id: number) => confirmAppointment(id),
        onSuccess: invalidate,
    });
}

export function useCompleteAppointment() {
    const invalidate = useInvalidateAppointments();
    return useMutation({
        mutationFn: (id: number) => completeAppointment(id),
        onSuccess: invalidate,
    });
}

export function useCancelAppointment() {
    const invalidate = useInvalidateAppointments();
    return useMutation({
        mutationFn: ({ id, ...dto }: CancelAppointmentDto & { id: number }) => cancelAppointment(id, dto),
        onSuccess: invalidate,
    });
}

export function useRescheduleAppointment() {
    const invalidate = useInvalidateAppointments();
    return useMutation({
        mutationFn: ({ id, ...dto }: RescheduleAppointmentDto & { id: number }) => rescheduleAppointment(id, dto),
        onSuccess: invalidate,
    });
}
