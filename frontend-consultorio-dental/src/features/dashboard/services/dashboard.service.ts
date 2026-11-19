import { get } from "@/services/api";
import type { DashboardStats, DashboardStatsResponse } from "@/features/dashboard/types/dashboard.model";

export async function getDashboardStats(): Promise<DashboardStats> {
    const { data } = await get<DashboardStatsResponse>("/dashboard/stats");

    return {
        timezone: data.timezone,
        generatedAt: new Date(data.generatedAt),
        today: { total: data.appointments.today.total, byStatus: data.appointments.today.byStatus },
        allByStatus: data.appointments.byStatus,
        appointmentsTotal: data.appointments.total,
        upcoming: data.appointments.upcoming.map((item) => ({ ...item, scheduled_at: new Date(item.scheduled_at) })),
        patients: data.patients,
        services: data.services,
    };
}
