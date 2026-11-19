import { get, patch, post } from "@/services/api";
import { buildQueryString, mapPaginated } from "@/utils/query";
import { appointmentDetailMap, appointmentMap } from "@/features/appointments/types/appointment.mapper";

import type {
    AppointmentDetailResponse,
    AppointmentResponse,
} from "@/features/appointments/types/appointment.response";
import type { Appointment, AppointmentDetail } from "@/features/appointments/types/appointment.model";
import type { AppointmentFilters } from "@/features/appointments/types/appointment.filters";
import type {
    CancelAppointmentDto,
    CreateAppointmentDto,
    RescheduleAppointmentDto,
    UpdateAppointmentDto,
} from "@/features/appointments/types/create-appointment.dto";
import type { Paginated } from "@/types/pagination";

export async function getAllAppointments(filters: AppointmentFilters = {}): Promise<Paginated<Appointment>> {
    const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        patient_id: filters.patient_id,
        status: filters.status,
        search: filters.search,
        from: filters.from,
        to: filters.to,
        sort: filters.sort,
        completed_without_consultation: filters.completed_without_consultation,
    });

    const response = await get<Paginated<AppointmentResponse>>(`/appointments${query}`);
    return mapPaginated(response.data, appointmentMap);
}

const RANGE_PAGE_SIZE = 100;
/** Tope de seguridad: 50 páginas de 100 citas (5 000) para un mismo rango. */
const RANGE_MAX_PAGES = 50;

/**
 * Todas las citas de un rango de días (inclusive, zona del consultorio), en orden
 * cronológico. El backend pagina (máx. 100): se pide la página 1 para conocer el
 * total y el resto de páginas se piden en paralelo. Si el rango supera el tope,
 * `truncated` es true para que la UI lo avise en lugar de ocultarlo.
 */
export async function getAppointmentsInRange(
    from: string,
    to: string,
    filters: Pick<AppointmentFilters, "status" | "search"> = {},
): Promise<{ items: Appointment[]; total: number; truncated: boolean }> {
    const fetchPage = (page: number) =>
        getAllAppointments({ ...filters, from, to, sort: "asc", page, limit: RANGE_PAGE_SIZE });

    const first = await fetchPage(1);
    const totalPages = Math.max(1, Math.ceil(first.total / RANGE_PAGE_SIZE));
    const lastPage = Math.min(totalPages, RANGE_MAX_PAGES);

    const rest = await Promise.all(
        Array.from({ length: Math.max(0, lastPage - 1) }, (_, index) => fetchPage(index + 2)),
    );

    // Dedupe por id: si cambian las citas entre peticiones, una misma cita podría repetirse.
    const byId = new Map<number, Appointment>();
    for (const page of [first, ...rest]) {
        for (const appointment of page.items) byId.set(appointment.id, appointment);
    }

    return {
        items: [...byId.values()].sort((a, b) => a.scheduled_at.getTime() - b.scheduled_at.getTime()),
        total: first.total,
        truncated: totalPages > RANGE_MAX_PAGES,
    };
}

export async function getAppointmentById(id: number): Promise<AppointmentDetail> {
    const response = await get<AppointmentDetailResponse>(`/appointments/${id}`);
    return appointmentDetailMap(response.data);
}

export async function createAppointment(appointment: CreateAppointmentDto) {
    const response = await post<AppointmentResponse>("/appointments", appointment);
    return response.data;
}

export async function updateAppointment(id: number, dto: UpdateAppointmentDto): Promise<AppointmentDetail> {
    const response = await patch<AppointmentDetailResponse>(`/appointments/${id}`, dto);
    return appointmentDetailMap(response.data);
}

export async function confirmAppointment(id: number) {
    const response = await patch<{ id: number; status: string }>(`/appointments/${id}/confirm`, {});
    return response.data;
}

export async function completeAppointment(id: number) {
    const response = await patch<{ id: number; status: string }>(`/appointments/${id}/complete`, {});
    return response.data;
}

export async function cancelAppointment(id: number, dto: CancelAppointmentDto) {
    const response = await patch<{ id: number; status: string }>(`/appointments/${id}/cancel`, dto);
    return response.data;
}

export async function rescheduleAppointment(id: number, dto: RescheduleAppointmentDto) {
    const response = await patch<unknown>(`/appointments/${id}/reschedule`, dto);
    return response.data;
}
