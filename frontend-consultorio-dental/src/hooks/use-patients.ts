import { requestGetPatients, requestGetPatient } from "../services/patients.service"
import { useState } from "react";

import type { Patient } from "@/types/models/patient";

export function usePatients() {

    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function getPatients() {

        setError(null);
        setIsLoading(true);

        try {
            const patientsData = await requestGetPatients();
            setPatients(patientsData);

        } catch(error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    async function getPatient(id: number): Promise<Patient | null> {

        setError(null);
        setIsLoading(true);

        try {
            const patient = await requestGetPatient(id);
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
        getPatients, 
        getPatient, 
        isLoading, 
        error 
    }
}