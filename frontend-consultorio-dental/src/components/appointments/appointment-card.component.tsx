import { StatusSpan } from "@/components/common/span.component";
import { Badge } from "@/components/ui/badge";
import { StatusAppointment } from "@/types/enums/status-appointment.enum";
import type { Appointment } from "@/types/models/appointment"
import { formatFirstLetterUppercase, formatTotalMinutesToHours } from "@/utils/formatters";

export interface AppointmentCardProps {
    appointment: Appointment;
    onClick?: () => void;
}


const COLORS_BY_STATUS: Record<StatusAppointment, string> = {
    [StatusAppointment.PENDIENTE]: 'bg-neutral-200 text-neutral-700',
    [StatusAppointment.CONFIRMADA]: 'bg-green-200 text-green-700',
    [StatusAppointment.COMPLETADA]: 'bg-blue-200 text-blue-700',
    [StatusAppointment.CANCELADA]: 'bg-red-200 text-red-700',
    [StatusAppointment.REPROGRAMADA]: 'bg-orange-200 text-orange-700',
};


export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
    
    const colors = COLORS_BY_STATUS[appointment.status];

    return (
        <>
            <div 
                className="flex flex-col min-w-[250px] rounded-xl p-2 border transition-transform duration-200 hover:scale-102 cursor-pointer gap-2"
                onClick={onClick}>
                <div className={`font-bold text-sm rounded-lg p-2 ${colors}`}>
                    {formatFirstLetterUppercase(appointment.status)}
                </div>

                <div className="font-medium">
                    {`${appointment.patient.name} ${appointment.patient.lastname}`}
                </div>

                <div className="flex items-center  justify-between border-t">
                    <p className="text-sm font-medium text-gray-500">{`${appointment.service.name}`}</p>
                    <p>{formatTotalMinutesToHours(appointment.durationMinutes)}</p>
                </div>
            </div>

            {
                /*
                <div className="bg-white flex flec-col justify-between w-64 min-h-[250px] rounded-lg px-7 py-6 cursor-pointer shadow-[0_2px_20px_rgba(0,0,0,0.15)] flex-col transition transform duration-300 hover:scale-103 active:scale-97"
                onClick={onClick}>
                    <div>
                        <StatusSpan status={appointment.status} />
                        <h2 className="mt-3 font-medium text-lg">
                            {`${appointment.patient.name} ${appointment.patient.lastname}`}
                        </h2>
                        <p className="mt-2 text-gray-500 text-sm break-words line-clamp-2">{appointment.notes}</p>
                    </div>
                    <div>
                        <div className="mt-3">
                            <Badge variant="base"> {appointment.service.name} </Badge>
                        </div>
    
                        <div className="py-2 border-t-1 mt-3 text-gray-600 text-sm font-medium flex justify-end">
                            {appointment.scheduled_at.toLocaleDateString()}
                        </div>
                    </div>
                </div>
                */
            }

        </>
    )

}