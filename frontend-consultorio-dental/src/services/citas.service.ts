import { get, post } from './api';
import type { AppointmentResponse } from '../types/api/responses/appointment.response';
import type { CreateAppointmentDto } from '../types/api/request/create-appointment.dto';

export async function requestObtenerCitas(): Promise<AppointmentResponse[]> {
    return await get('/appointments');
}

export async function requestCrearCita(cita: CreateAppointmentDto): Promise<AppointmentResponse> {
    return await post('/appointments', cita);
}