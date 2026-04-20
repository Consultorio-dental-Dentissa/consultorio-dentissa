import { useState } from "react";
import { requestCrearCita, requestObtenerCitas } from "../services/citas.service"
import type { ApiError } from "../types/api/responses/api-error";
import type { AppointmentResponse } from "../types/api/responses/appointment.response";
import type { CreateAppointmentDto } from "../types/api/request/create-appointment.dto";

export function useAppointments() {

        const [error, setError] = useState<string | null>(null);
        const [cargando, setCargando] = useState<boolean>(false);

        async function obtenerCitas(): Promise<AppointmentResponse[]> {

                setError(null);
                setCargando(true);
                return await requestObtenerCitas()
                        .catch((error: ApiError) => { setError(error.message); throw error.message; })
                        .finally(() => setCargando(false));
        }

        async function crearCita(nuevaCita: CreateAppointmentDto): Promise<AppointmentResponse> {

                setError(null);
                setCargando(true);

                return await requestCrearCita(nuevaCita)
                        .catch((error: ApiError) => { setError(error.message); throw error.message; })
                        .finally(() => setCargando(false));
        }

        return { obtenerCitas, crearCita, cargando, error }
}