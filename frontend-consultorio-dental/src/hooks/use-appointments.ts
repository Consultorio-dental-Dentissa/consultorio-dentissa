import { useState } from "react";
import { requestCreateAppointment, requestGetAppointments } from "../services/appointments.service"
import type { ApiError } from "../types/api/responses/api-error";
import type { AppointmentResponse } from "../types/api/responses/appointment.response";
import type { CreateAppointmentDto } from "../types/api/request/create-appointment.dto";

export function useAppointments() {

        const [error, setError] = useState<string | null>(null);
        const [loading, setLoading] = useState<boolean>(false);

        async function getAppointments(): Promise<AppointmentResponse[]> {

                setError(null);
                setLoading(true);
                return await requestGetAppointments()
                        .catch((error: ApiError) => { setError(error.message); throw error.message; })
                        .finally(() => setLoading(false));
        }

        async function createAppointment(newAppointment: CreateAppointmentDto): Promise<AppointmentResponse> {

                setError(null);
                setLoading(true);

                return await requestCreateAppointment(newAppointment)
                        .catch((error: ApiError) => { setError(error.message); throw error.message; })
                        .finally(() => setLoading(false));
        }

        return { getAppointments, createAppointment, loading, error }
}