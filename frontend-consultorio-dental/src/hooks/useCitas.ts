import { useState } from "react";
import { requestCrearCita, requestObtenerCitas } from "../services/citas.service"
import type { ApiError } from "../types/respuestas/ApiError";
import type { RegistrarCita } from "../types/RegistrarCita";

export function useCitas() {

    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState<boolean>(false);

    async function obtenerCitas() {

        try {
            setError(null);
            setCargando(true);

            const citas = await requestObtenerCitas();
            return citas;

        } catch (error) {
            setError((error as ApiError).message);
            return null;

        } finally {
            setCargando(false);
        }
    }

    async function crearCita(registrarCita: RegistrarCita) {
        
        try {
            setError(null);
            setCargando(true);

            const cita = await requestCrearCita(registrarCita);
            return cita;

        } catch(error) {
            setError((error as ApiError).message);
            return null;
            
        } finally {
            setCargando(false);
        }

    }

    return { obtenerCitas, crearCita, cargando, error }
}