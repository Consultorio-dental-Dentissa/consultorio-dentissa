import { get, post, put } from './api';
import { AppointmentMap } from '@/types/mappers/appointment.mapper';

import type { AppointmentResponse } from '../types/api/responses/appointment.response';
import type { CreateAppointmentDto } from '../types/api/request/create-appointment.dto';
import type { UpdateAppointmentDto } from '../types/api/request/update-appointment.dto';
import type { Appointment } from '@/types/models/appointment';

export async function getAllAppointments(parameters?: string): Promise<Appointment[]> {

    const url = parameters ? `/appointments?${parameters}` : '/appointments';

    const response = await get<AppointmentResponse[]>(url);
    const appointmentsResponse = response.data;

    console.log(appointmentsResponse);
    return appointmentsResponse.map(appointment => AppointmentMap(appointment));
}

export async function getMyAppointments(): Promise<Appointment[]> {
    const response = await get<AppointmentResponse[]>('/appointments/me');
    const appointmentsResponse = response.data;
    return appointmentsResponse.map(appointment => AppointmentMap(appointment));
}

export async function getAppointmentsCount(parameters?: string): Promise<number> {

    const url = parameters ? `/appointments/count?${parameters}` : '/appointments/count';

    const response = await get<number>(url);
    const appointmentsCount = response.data;

    return appointmentsCount;
}

export async function createAppointment(appointment: CreateAppointmentDto): Promise<Appointment> {
    const response = await post<AppointmentResponse>('/appointments', appointment);
    const appointmentCreated = response.data;
    return AppointmentMap(appointmentCreated);
}

export async function updateAppointment(id: number, appointment: UpdateAppointmentDto): Promise<Appointment> {
    const response = await put<AppointmentResponse>(`/appointments/${id}`, appointment);
    const appointmentUpdated = response.data;
    return AppointmentMap(appointmentUpdated);
}