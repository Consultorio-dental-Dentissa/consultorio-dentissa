import { get, post } from './api';
import { AppointmentMap } from '@/types/mappers/appointment.mapper';

import type { AppointmentResponse } from '../types/api/responses/appointment.response';
import type { CreateAppointmentDto } from '../types/api/request/create-appointment.dto';
import type { Appointment } from '@/types/models/appointment';

export async function getAllAppointments(parameters?: string): Promise<Appointment[]> {

    const url = parameters ? `/appointments?${parameters}` : '/appointments';

    const response = await get<AppointmentResponse[]>(url);
    const appointmentsResponse = response.data;

    console.log(appointmentsResponse);
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