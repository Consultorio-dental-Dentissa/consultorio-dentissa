import { useState } from "react";
import { AppointmentCard } from "./appointment-card.component";
import { AppointmentInfoModal } from "./appointment-info-modal.component";
import type { Appointment } from "@/types/models/Appointment"

export interface AppoimentListProps {
    appointments: Appointment[]
}

export function AppointmentList({ appointments }: AppoimentListProps) {

    const [openInfoModal, setOpenInfoModal] = useState(false);
    const [actualAppointment, setActualAppointment] = useState<Appointment | null>(null);

    const openModalWithAppointmentInfo = (appointment: Appointment) => {
        setOpenInfoModal(true);
        setActualAppointment(appointment);
    }

    return (
        <>
            {
                appointments.length > 0 ?
                    <div className="mt-2 flex flex-row flex-wrap gap-6">
                        {appointments.map(appointment => <AppointmentCard appointment={appointment} onClick={() => openModalWithAppointmentInfo(appointment)}/>)}
                    </div>

                    :

                    <div className="flex justify-center items-center text-lg">
                        No se encontrarón citas aún.
                    </div>
            }

            {
                actualAppointment &&
                <AppointmentInfoModal
                    open={openInfoModal}
                    close={() => setOpenInfoModal(false)}
                    appointment={actualAppointment}
                />
                
            }
        </>
    );
}