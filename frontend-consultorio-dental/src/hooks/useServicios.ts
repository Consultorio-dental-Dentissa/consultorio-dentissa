import { useState } from "react";
import { requestObtenerServicios, requestCambiarEstadoServicio, requestCrearServicio } from "../services/servicios.service";

import type { RespuestaServicio } from "../types/api/responses/RespuestaServicio";
import type { ApiError } from "../types/api/responses/ApiError";
import type { CrearServicio } from "../types/api/request/CrearServicio";


export function useServicios() {

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function crearServicio(crearServicio: CrearServicio): Promise<RespuestaServicio> {
        
        setError(null);
        setLoading(true);

        return await requestCrearServicio(crearServicio)
            .catch((error: ApiError) => {setError(error.message); console.log(error); throw error.message;})
            .finally(() => setLoading(false));
    }

    async function obtenerServicios(): Promise<RespuestaServicio[]> {

        setError(null);
        setLoading(true);

        return await requestObtenerServicios()
            .catch((error: ApiError) => {setError(error.message); throw error.message})
            .finally(() => setLoading(false));
    }

    async function cambiarEstadoServicio(id: number, estado: boolean): Promise<boolean> {
        
        setError(null);

        return await requestCambiarEstadoServicio(id, estado)
            .catch((error: ApiError) => {setError(error.message); throw error.message})
    }

    return { obtenerServicios, cambiarEstadoServicio, crearServicio, loading, error }
}