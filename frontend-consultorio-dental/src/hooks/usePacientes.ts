import { requestObtenerPacientes } from "../services/pacientes.service"
import { useState } from "react";

export function usePacientes() {

    const [loading, setLoading] = useState<boolean>(false);

    async function obtenerPacientes() {

        try {
            setLoading(true);
            return await requestObtenerPacientes();
            
        } finally {
            setLoading(false);
        }
    }

    return { obtenerPacientes, loading }
}