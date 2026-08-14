import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import type { Appointment } from "@/features/appointments/types/appointment.model"
import { formatFirstLetterUppercase, formatTotalMinutesToHours } from "@/utils/formatters";

export interface AppointmentCardProps {
    appointment: Appointment;
    onClick?: () => void;
}


const COLORS_BY_STATUS: Record<STATUS_APPOINTMENT, string> = {
    [STATUS_APPOINTMENT.PENDIENTE]: 'bg-neutral-200 text-neutral-700',
    [STATUS_APPOINTMENT.CONFIRMADA]: 'bg-green-200 text-green-700',
    [STATUS_APPOINTMENT.COMPLETADA]: 'bg-blue-200 text-blue-700',
    [STATUS_APPOINTMENT.CANCELADA]: 'bg-red-200 text-red-700',
    [STATUS_APPOINTMENT.REPROGRAMADA]: 'bg-orange-200 text-orange-700',
};


export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
    
    const colors = COLORS_BY_STATUS[appointment.status];

    return (
        <>
            <div 
                className="flex flex-col rounded-xl p-2 border transition-transform duration-200 hover:scale-102 cursor-pointer gap-2"
                onClick={onClick}>
                <div className={`font-bold text-sm rounded-lg p-2 ${colors}`}>
                    {formatFirstLetterUppercase(appointment.status)}
                </div>

                <div className="font-medium truncate">
                    {`${appointment.patient.name} ${appointment.patient.lastname}`}
                </div>

                <div className="flex items-center justify-between mt-auto border-t">
                    <p className="text-sm font-medium text-gray-500">{`${appointment.service.name}`}</p>
                    <p>{formatTotalMinutesToHours(appointment.durationMinutes)}</p>
                </div>
            </div>
        </>
    )

}