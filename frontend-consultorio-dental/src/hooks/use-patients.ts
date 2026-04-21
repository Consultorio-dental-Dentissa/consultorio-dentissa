import { requestGetPatients, requestGetPatient } from "../services/patients.service"
import { useState } from "react";
import type { ApiError } from "../types/api/responses/api-error";

export function usePatients() {

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function getPatients() {

        setError(null);
        setLoading(true);
        
        return await requestGetPatients()
            .catch((error: ApiError) => {setError(error.message); throw error.message;})
            .finally(() => setLoading(false));
    }

    async function getPatient(id: number) {
        return await requestGetPatient(id);
    }

    return { getPatients, getPatient, loading, error }
}