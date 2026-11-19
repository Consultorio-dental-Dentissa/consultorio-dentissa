import type { PaginationParams } from "@/types/pagination";

/** Elemento de GET /audit-logs. */
export interface AuditLogResponse {
    id: number;
    user_id: number | null;
    action: string;
    entity: string;
    entity_id: number | null;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    created_at: string;
    user: { id: number; name: string; lastname: string } | null;
}

export interface AuditLog {
    id: number;
    action: string;
    entity: string;
    entity_id: number | null;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    created_at: Date;
    user: { id: number; name: string; lastname: string } | null;
}

export interface AuditFilters extends PaginationParams {
    action?: string;
    entity?: string;
    userId?: number;
    /** AAAA-MM-DD (zona del consultorio). */
    from?: string;
    to?: string;
}
