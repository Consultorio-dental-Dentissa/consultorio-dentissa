import { StatusAppointment } from "@/types/enums/status-appointment.enum";

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
    
    let styles: {backgroundColor: string; textColor: string; };

    switch(status) {
        case StatusAppointment.PENDIENTE:
            styles = {
                backgroundColor: 'bg-gray-500',
                textColor: 'text-white'
            }
            break;
        case StatusAppointment.CONFIRMADA:
            styles = {
                backgroundColor: 'bg-green-200',
                textColor: 'text-green-700'
            }
            break;
        case StatusAppointment.CANCELADA:
            styles = {
                backgroundColor: 'bg-red-200',
                textColor: 'text-red-600'
            }
            break;
        case StatusAppointment.REPROGRAMADA: {
            styles = {
                backgroundColor: 'bg-yellow-200',
                textColor: 'text-yellow-700'
            }
            break;
        }

        default:
            styles = {
                backgroundColor: 'bg-gray-400',
                textColor: 'bg-gray-600'
            }
            break;
    }
    
    return (
        <span className={`py-1 rounded-full font-medium px-3 ${styles.backgroundColor} ${styles.textColor}`}> { status.toLowerCase().charAt(0).toUpperCase() + status.slice(1).toLowerCase() } </span>
    )
}