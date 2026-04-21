import { get, post } from './api';
import type { AppointmentResponse } from '../types/api/responses/appointment.response';
import type { CreateAppointmentDto } from '../types/api/request/create-appointment.dto';

export async function requestGetAppointments(): Promise<AppointmentResponse[]> {
    return await get('/appointments');
}

export async function requestCreateAppointment(appointment: CreateAppointmentDto): Promise<AppointmentResponse> {
    return await post('/appointments', appointment);
}