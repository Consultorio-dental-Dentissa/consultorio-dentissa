import { useState } from "react";
import { requestCreateAppointment, requestGetAppointments } from "../services/appointments.service"

import type { CreateAppointmentDto } from "../types/api/request/create-appointment.dto";
import type { Appointment } from "@/types/models/appointment";

export function useAppointments() {

        const [error, setError] = useState<string | null>(null);
        const [isLoading, setLoading] = useState<boolean>(false);

        async function getAppointments(): Promise<Appointment[]> {

                setError(null);
                setLoading(true);
                return await requestGetAppointments()
                        .catch((error: Error) => { setError(error.message); throw error.message; })
                        .finally(() => setLoading(false));
        }

        async function createAppointment(newAppointment: CreateAppointmentDto): Promise<Appointment> {

                setError(null);
                setLoading(true);

                return await requestCreateAppointment(newAppointment)
                        .catch((error: Error) => { setError(error.message); throw error.message; })
                        .finally(() => setLoading(false));
        }

        return { getAppointments, createAppointment, loading: isLoading, error }
}