import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/features/dashboard/services/dashboard.service";

/** Las mutaciones de citas invalidan ["dashboard"]; además se refresca cada minuto. */
export function useDashboardStats() {
    return useQuery({
        queryKey: ["dashboard", "stats"],
        queryFn: getDashboardStats,
        refetchInterval: 60_000,
    });
}
