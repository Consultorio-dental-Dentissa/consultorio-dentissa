import { Modal } from "@/components/common/modal.component"
import { Button } from "@/components/ui/button"
import { StatusAppointment } from "@/types/enums/status-appointment.enum";
import type { Appointment } from "@/types/models/appointment";
import { useState } from "react";
import { AppointmentInfoSecction } from "./appointment-info-section.component";


interface AppointmentInfoModalProps {
    open: boolean;
    close: (open: boolean) => void;
    appointment: Appointment;
}

export function AppointmentInfoModal({ open, close, appointment }: AppointmentInfoModalProps) {

    const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);
    const [isEditinAppointment, setIsEditingAppointment] = useState(false);

    // Regla de negocio ya definida en RF-015: una consulta solo puede
    // crearse cuando la cita relacionada está en estatus "Completada".

    const canCreateConsultation = appointment.status === StatusAppointment.COMPLETADA || appointment.status === StatusAppointment.CONFIRMADA;

    return (
        <Modal
            title="Información de la cita"
            description="Detalles completos de la cita seleccionada"
            position="center"
            open={open}
            onClose={close}
        >

            {
                isCreatingConsultation ?
                    "Formulario crear consulta"

                :

                isEditinAppointment ?
                    "Formulario de editar cita"
                
                :

                <AppointmentInfoSecction
                    appointment={appointment}
                />

            }

            <div className="flex justify-end gap-2 border-t pt-4">
                {
                    !isCreatingConsultation && !isEditinAppointment ?
                        <>
                            <Button variant="outline" disabled={!canCreateConsultation} onClick={() => setIsCreatingConsultation(true)}>
                                Crear consulta
                            </Button>

                            <Button onClick={() => setIsEditingAppointment(true)}>
                                Modificar cita
                            </Button>
                        </>

                        :
                    
                    isCreatingConsultation ?
                        <>
                            <Button variant="outline" onClick={() => setIsCreatingConsultation(false)}>
                                Cancelar
                            </Button>

                            <Button onClick={() => {}}>
                                Guardar consulta
                            </Button>
                        </>

                        :
                    
                    isEditinAppointment ?
                        <>
                            <Button variant="outline" onClick={() => setIsEditingAppointment(false)}>
                                Cancelar
                            </Button>

                            <Button onClick={() => {}}>
                                Modificar cita
                            </Button>
                        </>
                    :

                    ''
                }
            </div>
        </Modal>
    )
}