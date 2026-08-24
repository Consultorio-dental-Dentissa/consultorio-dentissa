import { get, post } from '@/services/api';
import { AppointmentMap } from '@/features/appointments/types/appointment.mapper';

import type { AppointmentResponse } from '@/features/appointments/types/appointment.response';
import type { CreateAppointmentDto } from '@/features/appointments/types/create-appointment.dto';
import type { Appointment } from '@/features/appointments/types/appointment.model';
import type { AppointmentFilters } from '../types/appointment.filters';

export async function getAllAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {

    const params = new URLSearchParams();

    if (filters?.status && filters.status !== 'TODOS') {
        params.set('status', filters.status);
    }

    if (filters?.search) {
        params.set('search', filters.search);
    }

    const filtersString = params.toString();
    const url = filtersString ? `/appointments?${filtersString}` : '/appointments';
    const response = await get<AppointmentResponse[]>(url);

    return response.data.map(AppointmentMap);
}

export async function createAppointment(appointment: CreateAppointmentDto): Promise<Appointment> {
    const response = await post<AppointmentResponse>('/appointments', appointment);
    const appointmentCreated = response.data;
    return AppointmentMap(appointmentCreated);
}