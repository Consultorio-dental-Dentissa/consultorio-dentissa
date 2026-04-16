import { AppointmentCard } from "./appointment-card.component";
import type { Appointment } from "@/types/models/Appointment"

export interface AppoimentListProps {
    appointments: Appointment[]
}

export function AppointmentList({ appointments }: AppoimentListProps) {

    return (
        <>
            {
                appointments.length > 0 ?
                    <div className="mt-2 flex flex-row flex-wrap gap-6">
                        {appointments.map(appointment => <AppointmentCard appointment={appointment} />)}
                    </div>

                    :

                    <div className="flex justify-center items-center text-lg">
                        No se encontrarón citas aún.
                    </div>
            }
        </>
    );
}