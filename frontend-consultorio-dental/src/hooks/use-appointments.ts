import { useState } from "react";
import { requestCreateAppointment, requestGetAppointments } from "../services/appointments.service"

import type { CreateAppointmentDto } from "../types/api/request/create-appointment.dto";
import type { Appointment } from "@/types/models/appointment";

export function useAppointments() {

        const [appointments, setAppointments] = useState<Appointment[]>([]);
        const [isLoading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        async function getAppointments() {
                setError(null);
                setLoading(true);

                try {
                        const appointments = await requestGetAppointments();
                        setAppointments(appointments);
                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                }

        }

        async function createAppointment(newAppointment: CreateAppointmentDto): Promise<Appointment | null> {
                setError(null);
                setLoading(true);

                try {
                        const appointmentCreated = await requestCreateAppointment(newAppointment);
                        setAppointments(prev => [...prev, appointmentCreated]);
                        return appointmentCreated;

                } catch(error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                        return null;
                }
        }

        return {
                appointments,
                getAppointments,
                createAppointment,
                isLoading,
                error
        }
}