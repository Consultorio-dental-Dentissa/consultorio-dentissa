import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { Role } from "@/features/users/types/rol.enum";
import { ROLE_LABELS } from "@/config/labels";

const APPOINTMENT_VARIANTS: Record<string, BadgeVariant> = {
    [STATUS_APPOINTMENT.PENDIENTE]: "pending",
    [STATUS_APPOINTMENT.CONFIRMADA]: "confirmed",
    [STATUS_APPOINTMENT.COMPLETADA]: "completed",
    [STATUS_APPOINTMENT.CANCELADA]: "canceled",
    [STATUS_APPOINTMENT.REPROGRAMADA]: "rescheduled",
};

const APPOINTMENT_LABELS: Record<string, string> = {
    [STATUS_APPOINTMENT.PENDIENTE]: "Pendiente",
    [STATUS_APPOINTMENT.CONFIRMADA]: "Confirmada",
    [STATUS_APPOINTMENT.COMPLETADA]: "Completada",
    [STATUS_APPOINTMENT.CANCELADA]: "Cancelada",
    [STATUS_APPOINTMENT.REPROGRAMADA]: "Reprogramada",
};

/** Badge de estado de una cita de docs/DISEÑO-FINAL (píldora de color suave + texto; el color nunca es el único indicador). */
export function AppointmentStatusBadge({ status, size = "md" }: { status: string; size?: "md" | "lg" }) {
    return (
        <Badge
            variant={APPOINTMENT_VARIANTS[status] ?? "base"}
            className={size === "lg" ? "px-[11px] py-1 text-[13px]" : undefined}
        >
            {APPOINTMENT_LABELS[status] ?? status}
        </Badge>
    );
}

interface ActiveBadgeProps {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}

/** Badge de estado activo/inactivo para usuarios, pacientes y servicios. */
export function ActiveBadge({ active, activeLabel = "Activo", inactiveLabel = "Inactivo" }: ActiveBadgeProps) {
    return (
        <Badge variant={active ? "success" : "base"}>
            {active ? activeLabel : inactiveLabel}
        </Badge>
    );
}

const ROLE_VARIANTS: Record<string, BadgeVariant> = {
    [Role.ADMINISTRADOR]: "admin",
    [Role.ASISTENTE]: "assistant",
    [Role.PACIENTE]: "patient",
};

export function RoleBadge({ role }: { role: string }) {
    return <Badge variant={ROLE_VARIANTS[role] ?? "base"}>{ROLE_LABELS[role] ?? role}</Badge>;
}
