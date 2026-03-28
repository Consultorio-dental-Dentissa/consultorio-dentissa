import { useState } from "react";
import { requestObtenerServicios, requestCambiarEstadoServicio, requestCrearServicio } from "../services/servicios.service";

import type { RespuestaServicio } from "../types/respuestas/RespuestaServicio";
import type { ApiError } from "../types/respuestas/ApiError";
import type { RegistrarServicio } from "../types/RegistrarServicio";


export function useServicios() {

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function crearServicio(registrarServicio: RegistrarServicio): Promise<RespuestaServicio | null> {
        
        setError(null);
        setLoading(true);

        return await requestCrearServicio(registrarServicio)
            .catch((error: ApiError) => {setError(error.message); return null;})
            .finally(() => setLoading(false));
    }

    async function obtenerServicios(): Promise<RespuestaServicio[] | null> {

        setError(null);
        setLoading(true);

        return await requestObtenerServicios()
            .catch((error: ApiError) => {setError(error.message); return null})
            .finally(() => setLoading(false));
    }

    async function cambiarEstadoServicio(id: number, estado: boolean): Promise<boolean | null> {
        
        setError(null);

        return await requestCambiarEstadoServicio(id, estado)
            .catch((error: ApiError) => {setError(error.message); return null})
    }

    return { obtenerServicios, cambiarEstadoServicio, crearServicio, loading, error }
}