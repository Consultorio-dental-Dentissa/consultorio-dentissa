import { StatusAppointment } from "@/types/enums/status-appointment.enum";
import { Role } from "@/types/enums/rol.enum";
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
        case StatusAppointment.PENDIENTE:
            variant = "base";
            break;
        case StatusAppointment.CONFIRMADA:
            variant = "primary";
            break;
        case StatusAppointment.CANCELADA:
            variant = "destructive";
            break;
        case StatusAppointment.REPROGRAMADA: {
            variant = "warning";
            break;
        }


        /* Aprovechamos para incluir los roles de los usuarios */
        case Role.ADMINISTRADOR: {
            variant = "admin";
            break;
        }

        case Role.ASISTENTE: {
            variant = "assistant";
            break;
        }

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