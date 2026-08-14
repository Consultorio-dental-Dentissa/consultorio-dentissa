import { useState } from "react";
import { AppointmentCard } from "@/features/appointments/components/appointment-card.component";
import { AppointmentInfoModal } from "@/features/appointments/components/appointment-info-modal.component";
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { Spinner } from "@/components/ui/spinner";
import type { Appointment } from "@/features/appointments/types/appointment.model"

export function AppointmentList() {

    const [openInfoModal, setOpenInfoModal] = useState(false);
    const [actualAppointment, setActualAppointment] = useState<Appointment | null>(null);

    const openModalWithAppointmentInfo = (appointment: Appointment) => {
        setOpenInfoModal(true);
        setActualAppointment(appointment);
    }
    
    const appointments = useAppointments();
    
    return (
        <>
            {
                appointments.isLoading ? (
                    <div className="flex justify-center">
                        <Spinner className="size-5" />
                    </div>
                )

                :
            
                (!appointments.data || !appointments.data?.length) ? (
                    <div className="flex justify-center items-center text-md">
                        No se encontrarón citas aún.
                    </div>
                )
            
                :
            
                appointments.data?.length && (
                    <div className="mt-2 w-full grid grid-cols-[repeat(auto-fit,minmax(18%,18%))] gap-3">
                        {appointments.data.map(appointment =>
                            <AppointmentCard
                                appointment={appointment}
                                onClick={() => openModalWithAppointmentInfo(appointment)}
                            />
                        )}
                    </div>
                )
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