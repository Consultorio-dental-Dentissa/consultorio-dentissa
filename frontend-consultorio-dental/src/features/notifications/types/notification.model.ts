import type { PaginationParams } from "@/types/pagination";

/** Elemento de GET /notifications. */
export interface NotificationResponse {
    id: number;
    type: string;
    message: string;
    is_read: boolean;
    read_at: string | null;
    appointment_id: number | null;
    created_at: string;
}

export interface Notification {
    id: number;
    /** CITA_CONFIRMADA, CITA_COMPLETADA, CITA_CANCELADA, CITA_REPROGRAMADA, CONSULTA_REGISTRADA... */
    type: string;
    message: string;
    is_read: boolean;
    appointment_id: number | null;
    created_at: Date;
}

export interface NotificationFilters extends PaginationParams {
    /** true = solo leídas, false = solo no leídas, undefined = todas. */
    read?: boolean;
}
