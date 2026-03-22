import { useState } from "react";
import { requestObtenerServicios, requestCambiarEstadoServicio, requestCrearServicio } from "../services/servicios.service";
import type { RespuestaServicio } from "../types/respuestas/RespuestaServicio";
import type { ApiError } from "../types/respuestas/ApiError";
import type { RegistrarServicio } from "../types/RegistrarServicio";


export function useServicios() {

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function crearServicio(registrarServicio: RegistrarServicio): Promise<RespuestaServicio | null> {
        
        try {
            setError(null);
            return await requestCrearServicio(registrarServicio);

        } catch(error) {

            setError((error as ApiError).message);
            return null;
        }
    }

    async function obtenerServicios(): Promise<RespuestaServicio[] | undefined> {

        try {
            setError(null);
            setLoading(true);
            return await requestObtenerServicios();
        } catch(error) {
            setError((error as ApiError).message);
        } finally {
            setLoading(false);
        }
    }

    async function cambiarEstadoServicio(id: number, estado: boolean): Promise<boolean | null> {
        try {
            setError(null);
            return await requestCambiarEstadoServicio(id, estado);
        } catch(error) {
            setError((error as ApiError).message);
            return null;
        }
    }

    return { obtenerServicios, cambiarEstadoServicio, crearServicio, loading, error }
}