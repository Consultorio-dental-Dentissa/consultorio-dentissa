import { useState } from "react";
import { createAppointment, getAllAppointments } from "@/features/appointments/services/appointments.service"

import type { CreateAppointmentDto } from "@/features/appointments/types/create-appointment.dto";
import type { Appointment } from "@/features/appointments/types/appointment.model";

export function useAppointments() {

        const [appointments, setAppointments] = useState<Appointment[]>([]);
        const [isLoadingFetching, setIsLoadingFetching] = useState(false);
        const [isLoading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        async function useGetAllAppointments(parameters?: string) {
                setError(null);
                setIsLoadingFetching(true);

                try {
                        const appointments = await getAllAppointments(parameters);
                        setAppointments(appointments);
                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                } finally {
                        setIsLoadingFetching(false);
                }

        }

        async function useCreateAppointment(newAppointment: CreateAppointmentDto): Promise<Appointment | null> {
                setError(null);
                setLoading(true);

                try {
                        const appointmentCreated = await createAppointment(newAppointment);
                        setAppointments(prev => [...prev, appointmentCreated]);
                        return appointmentCreated;

                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                        return null;
                } finally {
                        setLoading(false);
                }
        }

        return {
                appointments,
                useGetAllAppointments,
                useCreateAppointment,
                isLoading,
                isLoadingFetching,
                error
        }
}