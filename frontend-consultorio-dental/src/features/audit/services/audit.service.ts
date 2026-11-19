import { get } from "@/services/api";
import { buildQueryString } from "@/utils/query";
import type { AuditFilters, AuditLog, AuditLogResponse } from "@/features/audit/types/audit.model";
import type { Paginated } from "@/types/pagination";

/** GET /audit-logs (solo ADMIN, solo lectura). `from`/`to` son días de la zona del consultorio. */
export async function getAuditLogs(filters: AuditFilters = {}): Promise<Paginated<AuditLog>> {
    const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        action: filters.action,
        entity: filters.entity,
        userId: filters.userId,
        from: filters.from,
        to: filters.to,
    });

    const response = await get<Paginated<AuditLogResponse>>(`/audit-logs${query}`);
    const { items, total, page, limit } = response.data;

    return {
        items: items.map((item) => ({
            id: item.id,
            action: item.action,
            entity: item.entity,
            entity_id: item.entity_id,
            before: item.before,
            after: item.after,
            created_at: new Date(item.created_at),
            user: item.user,
        })),
        total, page, limit,
    };
}
