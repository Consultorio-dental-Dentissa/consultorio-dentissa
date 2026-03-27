import { useState } from "react";
import { requestCrearCita, requestObtenerCitas } from "../services/citas.service"
import type { ApiError } from "../types/respuestas/ApiError";
import type { RegistrarCita } from "../types/RegistrarCita";
import type { RespuestaCita } from "../types/respuestas/RespuestaCita";

export function useCitas() {

    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState<boolean>(false);

    async function obtenerCitas(): Promise<RespuestaCita[] | null> {

        setError(null);
        setCargando(true);

        return await requestObtenerCitas()
            .catch((error: ApiError) => {setError(error.message); return null;})
            .finally(() => setCargando(false));
    }

    async function crearCita(registrarCita: RegistrarCita) {
        
        setError(null);
        setCargando(true);

        return await requestCrearCita(registrarCita)
            .catch((error: ApiError) => {setError(error.message); return null;})
            .finally(() => setCargando(false));
    }

    return { obtenerCitas, crearCita, cargando, error }
}