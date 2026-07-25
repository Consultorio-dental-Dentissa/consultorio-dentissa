import { useState } from "react";
import { createAppointment, getAllAppointments, getAppointmentsCount, updateAppointment } from "../services/appointments.service"

import type { CreateAppointmentDto } from "../types/api/request/create-appointment.dto";
import type { UpdateAppointmentDto } from "../types/api/request/update-appointment.dto";
import type { Appointment } from "@/types/models/appointment";

export function useAppointments() {

        const [appointments, setAppointments] = useState<Appointment[]>([]);
        const [isLoading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        async function useGetAllAppointments(parameters?: string) {
                setError(null);
                setLoading(true);

                try {
                        const appointments = await getAllAppointments(parameters);
                        setAppointments(appointments);
                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                } finally {
                        setLoading(false);
                }
        }

        async function useGetAppointmentsCount(filters?: string) {
                setError(null);
                setLoading(true);

                try {
                        const count = await getAppointmentsCount(filters);
                        return count;
                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                } finally {
                        setLoading(false);
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

        async function useUpdateAppointment(id: number, updatedAppointment: UpdateAppointmentDto): Promise<Appointment | null> {
                setError(null);
                setLoading(true);

                try {
                        const appointmentUpdated = await updateAppointment(id, updatedAppointment);
                        setAppointments(prev => prev.map(appointment => appointment.id === id ? appointmentUpdated : appointment));
                        return appointmentUpdated;

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
                useGetAppointmentsCount,
                useCreateAppointment,
                useUpdateAppointment,
                isLoading,
                error
        }
}