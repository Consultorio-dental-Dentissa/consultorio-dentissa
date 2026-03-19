import { useState } from "react";
import { requestUsuarios } from "../services/usuarios.service"
import type { Usuario } from "../types/Usuario";

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

    return { obtenerUsuarios, loading }
}