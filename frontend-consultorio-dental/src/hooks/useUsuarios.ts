import { useState } from "react";
import { requestCambiarEstadoUsuario, requestRegistrarUsuario, requestUsuarios } from "../services/usuarios.service"
import type { Usuario } from "../types/Usuario";
import type { RegistrarUsuario } from "../types/RegistrarUsuario";

export function useUsuarios() {

    const [loading, setLoading] = useState<boolean>(false);

    async function obtenerUsuarios(): Promise<Usuario[]> {

        try {
            setLoading(true);
            return await requestUsuarios();
        } finally {
            setLoading(false);
        }
    }


    async function registrarUsuario(usuario: RegistrarUsuario): Promise<Usuario> {
        return await requestRegistrarUsuario(usuario)
    }


    async function cambiarEstadoUsuario(id: number, estado: boolean) {
        return await requestCambiarEstadoUsuario(id, estado);
    }

    return { obtenerUsuarios, registrarUsuario, cambiarEstadoUsuario, loading }
}