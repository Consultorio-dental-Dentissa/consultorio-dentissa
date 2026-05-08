import { getAllPatients, getPatientById } from "../services/patients.service"
import { useState } from "react";

import type { Patient } from "@/types/models/patient";

export function usePatients() {

    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function useGetAllPatients() {

        setError(null);
        setIsLoading(true);

        try {
            const patientsData = await getAllPatients();
            setPatients(patientsData);

        } catch(error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    async function useGetPatientById(id: number): Promise<Patient | null> {

        setError(null);
        setIsLoading(true);

        try {
            const patient = await getPatientById(id);
            return patient;

        } catch(error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    return { 
        patients, 
        useGetAllPatients, 
        useGetPatientById, 
        isLoading, 
        error 
    }
}