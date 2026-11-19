import { useState } from "react";
import { Bell, BellOff, Calendar, CalendarCheck, CalendarClock, CalendarX, CheckCheck, FileText, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/page-header.component";
import { TableCard } from "@/components/shared/table-card.component";
import { SectionLabel } from "@/components/shared/section-label.component";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
    useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications, useUnreadNotificationsCount,
} from "@/features/notifications/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { addDays, clinicDayKey, clinicTodayKey, formatClinicTime, formatKeyShort } from "@/utils/clinic-time";
import type { Notification } from "@/features/notifications/types/notification.model";

type Filter = "all" | "unread" | "read";

const FILTERS: { value: Filter; label: string; read: boolean | undefined }[] = [
    { value: "all", label: "Todas", read: undefined },
    { value: "unread", label: "No leídas", read: false },
    { value: "read", label: "Leídas", read: true },
];

/** Icono y colores por tipo de notificación (colores de Notificaciones.dc.html). */
const TYPE_STYLES: Record<string, { icon: LucideIcon; box: string }> = {
    CITA_CONFIRMADA: { icon: CalendarCheck, box: "bg-success-soft text-success" },
    CITA_COMPLETADA: { icon: CalendarCheck, box: "bg-info-soft text-info" },
    CITA_CANCELADA: { icon: CalendarX, box: "bg-danger-soft text-destructive" },
    CITA_REPROGRAMADA: { icon: CalendarClock, box: "bg-warning-soft text-warning" },
    CITA_ACTUALIZADA: { icon: CalendarClock, box: "bg-info-soft text-info" },
    CONSULTA_REGISTRADA: { icon: FileText, box: "bg-info-soft text-info" },
    CONSULTA_ACTUALIZADA: { icon: FileText, box: "bg-info-soft text-info" },
};
const DEFAULT_STYLE = { icon: Calendar, box: "bg-brand-soft text-brand" };

/** Título derivado del tipo: el backend solo entrega type + message. */
const TYPE_TITLES: Record<string, string> = {
    CITA_CONFIRMADA: "Cita confirmada",
    CITA_COMPLETADA: "Cita completada",
    CITA_CANCELADA: "Cita cancelada",
    CITA_REPROGRAMADA: "Cita reprogramada",
    CITA_ACTUALIZADA: "Cita actualizada",
    CONSULTA_REGISTRADA: "Consulta registrada",
    CONSULTA_ACTUALIZADA: "Consulta actualizada",
};

function groupLabel(key: string, today: string): "Hoy" | "Ayer" | "Anteriores" {
    if (key === today) return "Hoy";
    if (key === addDays(today, -1)) return "Ayer";
    return "Anteriores";
}

function NotificationRow({ notification, onRead, busy, today }: { notification: Notification; onRead: (n: Notification) => void; busy: boolean; today: string }) {
    const style = TYPE_STYLES[notification.type] ?? DEFAULT_STYLE;
    const Icon = style.icon;
    const key = clinicDayKey(notification.created_at);
    const time = key === today || key === addDays(today, -1)
        ? formatClinicTime(notification.created_at)
        : `${formatKeyShort(key)}, ${formatClinicTime(notification.created_at)}`;
    const title = TYPE_TITLES[notification.type] ?? "Notificación";

    return (
        <li className={cn("flex items-center gap-4 border-b border-line-row px-6 py-[18px] last:border-b-0", !notification.is_read && "bg-brand-wash")}>
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", style.box)}>
                <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[16px] leading-tight font-extrabold">
                    {!notification.is_read && <span aria-hidden="true" className="size-[7px] shrink-0 rounded-full bg-primary" />}
                    {!notification.is_read && <span className="sr-only">Sin leer. </span>}
                    {title}
                </p>
                <p className="mt-1 text-[15px] leading-snug text-ink-3">{notification.message}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-sm text-ink-4">{time}</span>
                {!notification.is_read && (
                    <Button
                        variant="outline" size="sm" disabled={busy}
                        onClick={() => onRead(notification)}
                        aria-label={`Marcar como leída: ${title}. ${notification.message}`}
                    >
                        Marcar leída
                    </Button>
                )}
            </div>
        </li>
    );
}

/** Notificaciones del usuario en sesión (los tres roles): filtros, lectura individual y masiva. */
export default function NotificationsPage() {
    const [filter, setFilter] = useState<Filter>("all");
    const read = FILTERS.find((item) => item.value === filter)?.read;

    const query = useNotifications(read);
    const unread = useUnreadNotificationsCount();
    const markOne = useMarkNotificationAsRead();
    const markAll = useMarkAllNotificationsAsRead();

    // Dedupe por id: si llegan notificaciones nuevas entre páginas, una misma podría repetirse.
    const items = [
        ...new Map((query.data?.pages.flatMap((page) => page.items) ?? []).map((item) => [item.id, item])).values(),
    ];
    const total = query.data?.pages[0]?.total ?? 0;
    const unreadCount = unread.data ?? 0;
    const today = clinicTodayKey();

    const handleRead = (notification: Notification) => {
        if (notification.is_read) return;
        markOne.mutate(notification.id, { onError: (error) => toast.error(error.message) });
    };

    const handleReadAll = () =>
        markAll.mutate(undefined, {
            onSuccess: (result) =>
                toast.success(result.updated === 1 ? "1 notificación marcada como leída" : `${result.updated} notificaciones marcadas como leídas`),
            onError: (error) => toast.error(error.message),
        });

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Notificaciones"
                description={unreadCount > 0 ? `Tienes ${unreadCount} ${unreadCount === 1 ? "notificación sin leer" : "notificaciones sin leer"}` : "Estás al día: no tienes notificaciones sin leer"}
                actions={
                    <Button variant="outline" onClick={handleReadAll} disabled={markAll.isPending || unreadCount === 0}>
                        {markAll.isPending ? <Spinner /> : <CheckCheck aria-hidden="true" />}
                        Marcar todas como leídas
                    </Button>
                }
            />

            <div role="group" aria-label="Filtrar notificaciones" className="flex flex-wrap gap-2">
                {FILTERS.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => setFilter(item.value)}
                        aria-pressed={filter === item.value}
                        className={cn(
                            "h-[38px] rounded-lg border px-4 text-[14.5px] font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            filter === item.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-surface text-ink-3 hover:bg-surface-muted",
                        )}
                    >
                        {item.label}
                        {item.value === "unread" && unreadCount > 0 && ` (${unreadCount})`}
                    </button>
                ))}
            </div>

            <>
                {query.isPending ? (
                    <div className="flex flex-col gap-4 rounded-[10px] border border-line bg-surface p-5" aria-busy="true" role="status">
                        <span className="sr-only">Cargando notificaciones...</span>
                        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                ) : query.isError ? (
                    <TableCard><ErrorState message={query.error.message} onRetry={() => query.refetch()} /></TableCard>
                ) : items.length === 0 ? (
                    <TableCard><EmptyState
                        icon={filter === "all" ? Bell : BellOff}
                        title={filter === "unread" ? "Estás al día" : filter === "read" ? "Sin notificaciones leídas" : "Aún no tienes notificaciones"}
                        description={
                            filter === "unread"
                                ? "No tienes notificaciones sin leer."
                                : "Las alertas sobre tus citas aparecerán aquí."
                        }
                    /></TableCard>
                ) : (
                    <>
                        {(["Hoy", "Ayer", "Anteriores"] as const).map((label) => {
                            const group = items.filter((n) => groupLabel(clinicDayKey(n.created_at), today) === label);
                            if (group.length === 0) return null;
                            return (
                                <section key={label} aria-label={label} className="flex flex-col gap-3">
                                    <SectionLabel>{label}</SectionLabel>
                                    <TableCard>
                                        <ul aria-busy={query.isFetching} className={cn(query.isFetching && !query.isFetchingNextPage && "opacity-70")}>
                                            {group.map((notification) => (
                                                <NotificationRow
                                                    key={notification.id}
                                                    notification={notification}
                                                    today={today}
                                                    onRead={handleRead}
                                                    busy={markOne.isPending && markOne.variables === notification.id}
                                                />
                                            ))}
                                        </ul>
                                    </TableCard>
                                </section>
                            );
                        })}
                        <div className="py-1 text-center">
                            {query.hasNextPage ? (
                                <button
                                    type="button"
                                    onClick={() => query.fetchNextPage()}
                                    disabled={query.isFetchingNextPage}
                                    className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[14.5px] font-bold text-ink-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                    {query.isFetchingNextPage && <Spinner />} Cargar notificaciones anteriores
                                </button>
                            ) : (
                                <p className="text-[14.5px] text-ink-4">Mostrando {items.length} de {total}</p>
                            )}
                        </div>
                    </>
                )}
            </>
        </div>
    );
}
