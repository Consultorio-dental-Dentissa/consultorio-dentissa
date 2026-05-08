import { useState } from "react";
import { createAppointment, getAllAppointments } from "../services/appointments.service"

import type { CreateAppointmentDto } from "../types/api/request/create-appointment.dto";
import type { Appointment } from "@/types/models/appointment";

export function useAppointments() {

        const [appointments, setAppointments] = useState<Appointment[]>([]);
        const [isLoading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        async function useGetAllAppointments() {
                setError(null);
                setLoading(true);

                try {
                        const appointments = await getAllAppointments();
                        setAppointments(appointments);
                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                }

        }

        async function useCreateAppointment(newAppointment: CreateAppointmentDto): Promise<Appointment | null> {
                setError(null);
                setLoading(true);

                try {
                        const appointmentCreated = await createAppointment(newAppointment);
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
                useGetAllAppointments,
                useCreateAppointment,
                isLoading,
                error
        }
}