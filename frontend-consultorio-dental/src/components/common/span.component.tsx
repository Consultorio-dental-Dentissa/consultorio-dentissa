import { StatusAppointment } from "@/features/appointments/types/status-appointment.enum";
import { Role } from "@/features/users/types/rol.enum";
import { Badge, type BadgeVariant } from "../ui/badge";
import { formatFirstLetterUppercase } from "@/utils/formatters";

interface SpanProps {
    message: string
}

export function ErrorSpan({ message }: SpanProps) {
    return (
        <span className="text-red-500">{message}</span>
    );
}

interface StatusSpanProps {
    status: string;
}

export function StatusSpan({ status }: StatusSpanProps) {

    let variant: BadgeVariant;

    switch (status) {
        case "true":
            variant = "success";
            break;
        case "false":
            variant = "destructive";
            break;

        /* Badges for appointment status */
        case StatusAppointment.PENDIENTE:
            variant = "pending";
            break;
        case StatusAppointment.COMPLETADA:
            variant = "completed";
            break;
        case StatusAppointment.CONFIRMADA:
            variant = "confirmed";
            break;
        case StatusAppointment.CANCELADA:
            variant = "canceled";
            break;
        case StatusAppointment.REPROGRAMADA: {
            variant = "rescheduled";
            break;
        }

        /* Badges for users roles */
        case Role.ADMINISTRADOR:
            variant = "admin";
            break;
        case Role.ASISTENTE:
            variant = "assistant";
            break;
        case Role.PACIENTE: {
            variant = "patient";
            break;
        }


        default:
            variant = "base";
            break;
    }

    return (
        <Badge variant={variant}>{formatFirstLetterUppercase(status)}</Badge>
    )
}


interface ActiveSpanProps {
    status: boolean;
}

export const ActiveSpan = ({ status }: ActiveSpanProps) => {

    return (
        <Badge variant={status ? 'primary' : 'destructive'}>
            {status ? 'Activo' : 'No activo'}
        </Badge>
    )
}