import { StatusAppointment } from "@/types/enums/status-appointment.enum";
import { Badge, type BadgeVariant } from "../ui/badge";
import { formatFirstLetterUppercase } from "@/utils/formatters";

interface SpanProps {
    message: string
}

export function ErrorSpan({message}: SpanProps) {
    return(
        <span className="text-red-500">{message}</span>
    );
}

interface StatusSpanProps {
    status: string;
}

export function StatusSpan({ status }: StatusSpanProps) {
    
    let variant: BadgeVariant;

    switch(status) {
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

        default:
            variant = "base";
            break;
    }
    
    return (
        <Badge variant={variant}>{ formatFirstLetterUppercase(status) }</Badge>
    )
}