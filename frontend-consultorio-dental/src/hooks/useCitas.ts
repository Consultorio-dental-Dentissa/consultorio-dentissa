import { useState } from "react";
import { requestCrearCita, requestObtenerCitas } from "../services/citas.service"
import type { ApiError } from "../types/api/responses/ApiError";
import type { RespuestaCita } from "../types/api/responses/RespuestaCita";
import type { CrearCita } from "../types/api/request/CrearCita";

export function useCitas() {

        const [error, setError] = useState<string | null>(null);
        const [cargando, setCargando] = useState<boolean>(false);

        async function obtenerCitas(): Promise<RespuestaCita[] | null> {

                setError(null);
                setCargando(true);
                return await requestObtenerCitas()
                        .catch((error: ApiError) => { setError(error.message); return null; })
                        .finally(() => setCargando(false));
        }

        async function crearCita(nuevaCita: CrearCita) {

                setError(null);
                setCargando(true);

                return await requestCrearCita(nuevaCita)
                        .catch((error: ApiError) => { setError(error.message); return null; })
                        .finally(() => setCargando(false));
        }

        return { obtenerCitas, crearCita, cargando, error }
}