import { useState } from "react";
import { requestCambiarEstadoUsuario, requestRegistrarUsuario, requestUsuarios } from "../services/usuarios.service"
import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { ApiError } from "../types/api/responses/api-error";
import type { UserResponse } from "../types/api/responses/user.response";

export function useUsers() {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingTable, setLoadingTable] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function obtenerUsuarios(): Promise<UserResponse[]> {

        setError(null);
        setLoadingTable(true)

        return await requestUsuarios()
            .catch((error: ApiError) => {setError(error.message); throw error.message;})
            .finally(() => setLoadingTable(false));
    }

    async function registrarUsuario(usuario: CreateUserDto): Promise<UserResponse> {

        setError(null);
        setLoading(true);

        return await requestRegistrarUsuario(usuario)
            .catch((error: ApiError) => {setError(error.message); throw error.message;})
            .finally(() => {setLoading(false)})
    }

    async function cambiarEstadoUsuario(id: number, estado: boolean): Promise<boolean> {
        setError(null);
        
        return await requestCambiarEstadoUsuario(id, estado)
            .catch((error: ApiError) => {setError(error.message); throw error.message;})
    }

    return { obtenerUsuarios, registrarUsuario, cambiarEstadoUsuario, loading, loadingTable, error }
}