import { getAllPatients, getPatientById } from "@/features/patients/services/patients.service"
import { useQuery } from "@tanstack/react-query";
import type { PatientFilters } from "@/features/patients/types/patient.filters";

export function usePatients(filters?: PatientFilters) {
    return useQuery({
        queryKey: ['patients', filters],
        queryFn: () => getAllPatients(filters)
    });
}

export function useActualPatient(id: number) {
    return useQuery({
        queryKey: ['patient', id],
        queryFn: () => getPatientById(id)
    });
}