import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getNotifications,
    getUnreadNotificationsCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "@/features/notifications/services/notifications.service";

export const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"] as const;

/** Contador de no leídas. Se refresca solo cada minuto mientras la pestaña está activa. */
export function useUnreadNotificationsCount(enabled = true) {
    return useQuery({
        queryKey: UNREAD_COUNT_QUERY_KEY,
        queryFn: getUnreadNotificationsCount,
        enabled,
        refetchInterval: 60_000,
        staleTime: 30_000,
    });
}

const PAGE_SIZE = 15;

/** Lista paginada ("cargar anteriores") con filtro de leídas: true, false o todas. */
export function useNotifications(read: boolean | undefined) {
    return useInfiniteQuery({
        queryKey: ["notifications", "list", read ?? "all"],
        queryFn: ({ pageParam }) => getNotifications({ page: pageParam, limit: PAGE_SIZE, read }),
        initialPageParam: 1,
        getNextPageParam: (last) => (last.page * last.limit < last.total ? last.page + 1 : undefined),
    });
}

/** Marcar leídas cambia la lista y el contador de la campana. */
function useInvalidateNotifications() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

export function useMarkNotificationAsRead() {
    const invalidate = useInvalidateNotifications();
    return useMutation({
        mutationFn: (id: number) => markNotificationAsRead(id),
        onSuccess: invalidate,
    });
}

export function useMarkAllNotificationsAsRead() {
    const invalidate = useInvalidateNotifications();
    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: invalidate,
    });
}
