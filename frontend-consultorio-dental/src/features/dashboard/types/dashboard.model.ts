/** GET /dashboard/stats (solo ADMIN). */
export type StatusCounts = Record<"PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "REPROGRAMADA" | "COMPLETADA", number>;

export interface DashboardStatsResponse {
    timezone: string;
    generatedAt: string;
    appointments: {
        today: { from: string; to: string; total: number; byStatus: StatusCounts };
        byStatus: StatusCounts;
        total: number;
        upcoming: {
            id: number;
            scheduled_at: string;
            durationMinutes: number;
            status: string;
            patient: { name: string; lastname: string };
            service: { name: string };
        }[];
    };
    patients: { total: number; active: number };
    services: { total: number; active: number };
}

export interface DashboardStats {
    timezone: string;
    generatedAt: Date;
    today: { total: number; byStatus: StatusCounts };
    allByStatus: StatusCounts;
    appointmentsTotal: number;
    upcoming: {
        id: number;
        scheduled_at: Date;
        durationMinutes: number;
        status: string;
        patient: { name: string; lastname: string };
        service: { name: string };
    }[];
    patients: { total: number; active: number };
    services: { total: number; active: number };
}
