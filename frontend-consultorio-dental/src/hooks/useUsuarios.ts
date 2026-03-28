import { useState } from "react";
import { requestCambiarEstadoUsuario, requestRegistrarUsuario, requestUsuarios } from "../services/usuarios.service"
import type { CrearUsuario } from "../types/api/request/CrearUsuario";
import type { ApiError } from "../types/api/responses/ApiError";
import type { RespuestaUsuario } from "../types/api/responses/RespuestaUsuario";

export function useUsuarios() {

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function obtenerUsuarios(): Promise<RespuestaUsuario[] | null> {

        setError(null);
        setLoading(true)

        return await requestUsuarios()
            .catch((error: ApiError) => {setError(error.message); return null;})
            .finally(() => setLoading(false));
    }

    async function registrarUsuario(usuario: CrearUsuario): Promise<RespuestaUsuario | null> {

        setError(null);
        setLoading(true);

        return await requestRegistrarUsuario(usuario)
            .catch((error: ApiError) => {setError(error.message); return null;})
            .finally(() => {setLoading(false)})
    }

    async function cambiarEstadoUsuario(id: number, estado: boolean): Promise<boolean | null> {
        setError(null);
        
        return await requestCambiarEstadoUsuario(id, estado)
            .catch((error: ApiError) => {setError(error.message); return null;})
    }

    return { obtenerUsuarios, registrarUsuario, cambiarEstadoUsuario, loading, error }
}