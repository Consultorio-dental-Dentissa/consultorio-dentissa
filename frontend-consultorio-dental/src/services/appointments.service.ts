import { get, post } from './api';
import { AppointmentMap } from '@/types/mappers/appointment.mapper';

import type { AppointmentResponse } from '../types/api/responses/appointment.response';
import type { CreateAppointmentDto } from '../types/api/request/create-appointment.dto';
import type { Appointment } from '@/types/models/appointment';
import type { ApiResponse } from '@/types/api/responses/api.response';

export async function requestGetAppointments(): Promise<Appointment[]> {
    const response = await get<ApiResponse<AppointmentResponse[]>>('/appointments');
    const appointmentsResponse = response.data;
    return appointmentsResponse.map(appointment => AppointmentMap(appointment));
}

export async function requestCreateAppointment(appointment: CreateAppointmentDto): Promise<Appointment> {
    const response = await post<ApiResponse<AppointmentResponse>>('/appointments', appointment);
    const appointmentCreated = response.data;
    return AppointmentMap(appointmentCreated);
}