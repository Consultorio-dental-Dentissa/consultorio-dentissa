import { getAllPatients, getPatientById, getPatientsCount } from "../services/patients.service"
import { useState } from "react";

import type { Patient } from "@/types/models/patient";

export function usePatients() {

    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function useGetAllPatients(parameters?: string) {

        setError(null);
        setIsLoadingPatients(true);

        try {

            const patientsData = await getAllPatients(parameters);
            setPatients(patientsData);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
        } finally {
            setIsLoadingPatients(false);
        }
    }

    async function useGetPatientsCount(parameters?: string): Promise<number | undefined> {

        setError(null);
        setIsLoading(true);

        try {
            const count = await getPatientsCount(parameters);
            return count;

        } catch (error) {
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

        } catch (error) {
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
        useGetPatientsCount,
        useGetPatientById,
        isLoadingPatients,
        isLoading,
        error
    }
}