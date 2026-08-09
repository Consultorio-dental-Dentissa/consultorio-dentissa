import { getAllPatients, getPatientById } from "@/features/patients/services/patients.service"
import { useQuery } from "@tanstack/react-query";

export function usePatients() {
    return useQuery({
        queryKey: ['patients'],
        queryFn: () => getAllPatients()
    });
}

export function useActualPatient(id: number) {
    return useQuery({
        queryKey: ['patient', id],
        queryFn: () => getPatientById(id)
    });
}