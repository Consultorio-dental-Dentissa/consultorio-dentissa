import { Card } from "@/components/ui/card";
import { type Appointment } from "@/types/models/appointment";
import { formatDate, formatFirstLetterUppercase } from "@/utils/formatters";
import { Button } from "../ui/button";

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
}


const CARD_COLOR_BY_STATUS = {
    "PENDIENTE": 'bg-gray-200',
    "CONFIRMADA": 'bg-green-200',
    "CANCELADA": 'bg-red-300',
    "REPROGRAMADA": 'bg-orange-200',
    "COMPLETADA": 'bg-blue-200'
}


export function AppointmentCard({ appointment, onClick}: AppointmentCardProps) {
 
  return (
    <Card className="p-2 min-w-[20%] max-w-[20%] gap-1">
        <div className={`rounded-md p-1 ${CARD_COLOR_BY_STATUS[appointment.status]}`}>
            {formatFirstLetterUppercase(appointment.status)}
        </div>
        <div className="text-md font-bold py-2">
            {`${appointment.patient.name} ${appointment.patient.lastname}`}
        </div>
        <div className="flex flex-col justify-between">
            {formatDate(appointment.scheduled_at)}
            <Button size="sm" variant="secondary" onClick={() => onClick? onClick() : ''}>Ver información</Button>
        </div>

    </Card>
  )
}
 