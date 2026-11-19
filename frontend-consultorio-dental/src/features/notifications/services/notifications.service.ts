import { get, patch } from "@/services/api";
import { buildQueryString } from "@/utils/query";
import type { Notification, NotificationFilters, NotificationResponse } from "@/features/notifications/types/notification.model";
import type { Paginated } from "@/types/pagination";

/** Cantidad de notificaciones sin leer del usuario en sesión (GET /notifications/unread-count). */
export async function getUnreadNotificationsCount(): Promise<number> {
    const response = await get<{ unread: number }>("/notifications/unread-count");
    return response.data.unread;
}

function notificationMap(item: NotificationResponse): Notification {
    return {
        id: item.id,
        type: item.type,
        message: item.message,
        is_read: item.is_read,
        appointment_id: item.appointment_id,
        created_at: new Date(item.created_at),
    };
}

/** GET /notifications: propias del usuario, paginadas; `read` filtra leídas / no leídas. */
export async function getNotifications(filters: NotificationFilters = {}): Promise<Paginated<Notification>> {
    const query = buildQueryString({ page: filters.page, limit: filters.limit, read: filters.read });
    const response = await get<Paginated<NotificationResponse>>(`/notifications${query}`);
    const data = response.data;

    return { items: data.items.map(notificationMap), total: data.total, page: data.page, limit: data.limit };
}

export async function markNotificationAsRead(id: number) {
    const response = await patch<{ id: number; is_read: boolean }>(`/notifications/${id}/read`, {});
    return response.data;
}

export async function markAllNotificationsAsRead() {
    const response = await patch<{ updated: number }>("/notifications/read-all", {});
    return response.data;
}
