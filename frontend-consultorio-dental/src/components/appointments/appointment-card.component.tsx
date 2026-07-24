import { StatusSpan } from "@/components/common/span.component";
import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/types/models/appointment"

export interface AppointmentCardProps {
    appointment: Appointment;
    onClick?: () => void;
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {

    return (
        <>
            <div className="bg-white flex flec-col justify-between w-64 min-h-[250px] rounded-lg px-7 py-6 cursor-pointer border-2 flex-col transition transform duration-300 hover:scale-103 active:scale-97"
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
        </>
    )

}