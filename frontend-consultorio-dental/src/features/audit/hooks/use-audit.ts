import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/features/audit/services/audit.service";
import type { AuditFilters } from "@/features/audit/types/audit.model";

/** Las mutaciones de otros módulos invalidan la clave ["audit"]. */
export function useAuditLogs(filters?: AuditFilters, enabled = true) {
    return useQuery({
        queryKey: ["audit", "list", filters],
        queryFn: () => getAuditLogs(filters),
        placeholderData: keepPreviousData,
        enabled,
    });
}
