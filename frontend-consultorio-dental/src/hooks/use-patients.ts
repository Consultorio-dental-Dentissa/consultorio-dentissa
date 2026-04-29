import { requestGetPatients, requestGetPatient } from "../services/patients.service"
import { useState } from "react";

import type { Patient } from "@/types/models/patient";

export function usePatients() {

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function getPatients(): Promise<Patient[]> {

        setError(null);
        setLoading(true);
        
        return await requestGetPatients()
            .catch((error: Error) => {setError(error.message); throw error.message;})
            .finally(() => setLoading(false));
    }

    async function getPatient(id: number): Promise<Patient> {
        return await requestGetPatient(id);
    }

    return { getPatients, getPatient, loading, error }
}