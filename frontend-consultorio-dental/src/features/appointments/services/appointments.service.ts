import { get, post } from '@/services/api';
import { AppointmentMap } from '@/features/appointments/types/appointment.mapper';

import type { AppointmentResponse } from '@/features/appointments/types/appointment.response';
import type { CreateAppointmentDto } from '@/features/appointments/types/create-appointment.dto';
import type { Appointment } from '@/features/appointments/types/appointment.model';
import type { ApiResponse } from '@/types/api.response';

export async function getAllAppointments(parameters?: string): Promise<Appointment[]> {

    const url = parameters ? `/appointments?${parameters}` : '/appointments';

    const response = await get<ApiResponse<AppointmentResponse[]>>(url);
    const appointmentsResponse = response.data;

    console.log(appointmentsResponse);
    return appointmentsResponse.map(appointment => AppointmentMap(appointment));
}

export async function createAppointment(appointment: CreateAppointmentDto): Promise<Appointment> {
    const response = await post<ApiResponse<AppointmentResponse>>('/appointments', appointment);
    const appointmentCreated = response.data;
    return AppointmentMap(appointmentCreated);
}