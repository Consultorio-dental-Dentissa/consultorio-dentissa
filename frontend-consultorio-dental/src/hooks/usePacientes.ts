import { requestObtenerPacientes, requestObtenerPaciente } from "../services/pacientes.service"
import type { ApiError } from "../types/api/responses/ApiError";
import { useState } from "react";

export function usePacientes() {

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function obtenerPacientes() {

        setError(null);
        setLoading(true);
        
        return await requestObtenerPacientes()
            .catch((error: ApiError) => {setError(error.message); return null;})
            .finally(() => setLoading(false));
    }

    async function obtenerPaciente(id: number) {
        return await requestObtenerPaciente(id);
    }

    return { obtenerPacientes, obtenerPaciente, loading, error }
}