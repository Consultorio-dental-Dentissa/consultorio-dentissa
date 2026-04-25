import { get, post } from './api';
import { AppointmentMap } from '@/types/mappers/appointment.mapper';

import type { AppointmentResponse } from '../types/api/responses/appointment.response';
import type { CreateAppointmentDto } from '../types/api/request/create-appointment.dto';
import type { Appointment } from '@/types/models/appointment';

export async function requestGetAppointments(): Promise<Appointment[]> {
    const appointmentResponse = await get<AppointmentResponse[]>('/appointments');
    return appointmentResponse.map(appointment => AppointmentMap(appointment));
}

export async function requestCreateAppointment(appointment: CreateAppointmentDto): Promise<Appointment> {
    const appointmentResponse = await post<AppointmentResponse>('/appointments', appointment);
    return AppointmentMap(appointmentResponse);
}