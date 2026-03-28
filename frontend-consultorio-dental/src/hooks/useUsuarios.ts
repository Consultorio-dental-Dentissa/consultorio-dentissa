import { useState } from "react";
import { requestCambiarEstadoUsuario, requestRegistrarUsuario, requestUsuarios } from "../services/usuarios.service"
import type { Usuario } from "../types/Usuario";
import type { RegistrarUsuario } from "../types/RegistrarUsuario";
import type { ApiError } from "../types/respuestas/ApiError";

export function useUsuarios() {

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function obtenerUsuarios(): Promise<Usuario[] | null> {

        setError(null);
        setLoading(true)

        return await requestUsuarios()
            .catch((error: ApiError) => {setError(error.message); return null;})
            .finally(() => setLoading(false));
    }

    async function registrarUsuario(usuario: RegistrarUsuario): Promise<Usuario | null> {

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