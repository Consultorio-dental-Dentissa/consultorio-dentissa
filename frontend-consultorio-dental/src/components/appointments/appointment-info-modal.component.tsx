import { Modal } from "@/components/common/modal.component"
import { Button } from "@/components/ui/button"
import { StatusAppointment } from "@/types/enums/status-appointment.enum";
import type { Appointment } from "@/types/models/appointment";
import { useState, Fragment } from "react";
import { AppointmentInfoSecction } from "./appointment-info-section.component";
import { UpdateAppointmentForm, UPDATE_APPOINTMENT_FORM_ID } from "./update-appointment-form.component";
import type { Service } from "@/types/models/service";
import type { Patient } from "@/types/models/patient";
import type { UpdateAppointmentDto } from "@/types/api/request/update-appointment.dto";


interface AppointmentInfoModalProps {
    open: boolean;
    close: (open: boolean) => void;
    appointment: Appointment;
    patiensList: Patient[]
    servicesList: Service[]
    onUpdateAppointment: (id: number, dto: UpdateAppointmentDto) => Promise<Appointment | null>;
    isSaving: boolean;
}


export function AppointmentInfoModal({ open, close, appointment, patiensList, servicesList, onUpdateAppointment, isSaving }: AppointmentInfoModalProps) {

    const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);
    const [isEditinAppointment, setIsEditingAppointment] = useState(false);

    // Regla de negocio ya definida en RF-015: una consulta solo puede
    // crearse cuando la cita relacionada está en estatus "Completada".

    const canCreateConsultation = appointment.status === StatusAppointment.COMPLETADA || appointment.status === StatusAppointment.CONFIRMADA;

    const handleSubmitUpdate = async (dto: UpdateAppointmentDto) => {
        const updatedAppointment = await onUpdateAppointment(appointment.id, dto);
        if (updatedAppointment) {
            setIsEditingAppointment(false);
            close(false);
        }
    };

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
                    <UpdateAppointmentForm
                        appointment={appointment}
                        patients={patiensList}
                        services={servicesList}
                        onSubmit={handleSubmitUpdate}
                    />
                
                :

                <AppointmentInfoSecction
                    appointment={appointment}
                />

            }

            <div className="flex justify-end gap-2 border-t pt-4">
                {
                    !isCreatingConsultation && !isEditinAppointment ?
                        <Fragment key="view-actions">
                            <Button type="button" variant="outline" disabled={!canCreateConsultation} onClick={() => setIsCreatingConsultation(true)}>
                                Crear consulta
                            </Button>

                            <Button type="button" onClick={() => setIsEditingAppointment(true)}>
                                Modificar cita
                            </Button>
                        </Fragment>

                        :

                    isCreatingConsultation ?
                        <Fragment key="consultation-actions">
                            <Button type="button" variant="outline" onClick={() => setIsCreatingConsultation(false)}>
                                Cancelar
                            </Button>

                            <Button type="button" onClick={() => {}}>
                                Guardar consulta
                            </Button>
                        </Fragment>

                        :

                    isEditinAppointment ?
                        <Fragment key="edit-actions">
                            <Button type="button" variant="outline" onClick={() => setIsEditingAppointment(false)} disabled={isSaving}>
                                Cancelar
                            </Button>

                            <Button type="submit" form={UPDATE_APPOINTMENT_FORM_ID} disabled={isSaving}>
                                Modificar cita
                            </Button>
                        </Fragment>
                    :

                    ''
                }
            </div>
        </Modal>
    )
}