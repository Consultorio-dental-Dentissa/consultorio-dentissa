import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAllPatients,
    getMyPatientProfile,
    getPatientAppointmentHistory,
    getPatientById,
    getPatientConsultationHistory,
    updateMyProfile,
    updatePatient,
} from "@/features/patients/services/patients.service";
import type { PatientFilters } from "@/features/patients/types/patient.filters";
import type { UpdateMyProfileDto, UpdatePatientDto } from "@/features/patients/types/update-patient.dto";
import type { PaginationParams } from "@/types/pagination";
import { SESSION_QUERY_KEY } from "@/features/auth/context/auth-context";

export function usePatients(filters?: PatientFilters) {
    return useQuery({
        queryKey: ["patients", "list", filters],
        queryFn: () => getAllPatients(filters),
        placeholderData: keepPreviousData,
    });
}

export function usePatient(id: number | undefined) {
    return useQuery({
        queryKey: ["patients", "detail", id],
        queryFn: () => getPatientById(id as number),
        enabled: id !== undefined && !Number.isNaN(id),
    });
}

export function useMyPatientProfile(enabled = true) {
    return useQuery({
        queryKey: ["patients", "me"],
        queryFn: getMyPatientProfile,
        enabled,
    });
}

export function usePatientAppointmentHistory(id: number | undefined, params: PaginationParams) {
    return useQuery({
        queryKey: ["patients", "history", "appointments", id, params],
        queryFn: () => getPatientAppointmentHistory(id as number, params),
        enabled: id !== undefined && !Number.isNaN(id),
        placeholderData: keepPreviousData,
    });
}

export function usePatientConsultationHistory(id: number | undefined, params: PaginationParams, enabled: boolean) {
    return useQuery({
        queryKey: ["patients", "history", "consultations", id, params],
        queryFn: () => getPatientConsultationHistory(id as number, params),
        enabled: enabled && id !== undefined && !Number.isNaN(id),
        placeholderData: keepPreviousData,
    });
}

export function useUpdatePatient(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpdatePatientDto) => updatePatient(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            // Los nombres de paciente se muestran también en citas y usuarios.
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["audit"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
}

export function useUpdateMyProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpdateMyProfileDto) => updateMyProfile(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            // Correo/teléfono también viven en la sesión (/auth/me).
            queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
        },
    });
}
