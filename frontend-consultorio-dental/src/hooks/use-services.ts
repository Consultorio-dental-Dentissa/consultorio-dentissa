import { useState } from "react";
import { requestObtenerServicios, requestCambiarEstadoServicio, requestCrearServicio } from "../services/servicios.service";

import type { ServiceResponse } from "../types/api/responses/service.response";
import type { ApiError } from "../types/api/responses/api-error";
import type { CreateServiceDto } from "../types/api/request/create-service.dto";


export function useServices() {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingTable, setLoadingTable] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function crearServicio(crearServicio: CreateServiceDto): Promise<ServiceResponse> {
        
        setError(null);
        setLoading(true);

        return await requestCrearServicio(crearServicio)
            .catch((error: ApiError) => {setError(error.message); console.log(error); throw error.message;})
            .finally(() => setLoading(false));
    }

    async function obtenerServicios(): Promise<ServiceResponse[]> {

        setError(null);
        setLoadingTable(true);

        return await requestObtenerServicios()
            .catch((error: ApiError) => {setError(error.message); throw error.message})
            .finally(() => setLoadingTable(false));
    }

    async function cambiarEstadoServicio(id: number, status: boolean): Promise<boolean> {
        
        setError(null);

        return await requestCambiarEstadoServicio(id, status)
            .catch((error: ApiError) => {setError(error.message); throw error.message})
    }

    return { obtenerServicios, cambiarEstadoServicio, crearServicio, loading, loadingTable, error }
}