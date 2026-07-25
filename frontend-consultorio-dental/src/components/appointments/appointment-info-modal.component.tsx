import { Modal } from "@/components/common/modal.component"
import { Button } from "@/components/ui/button"
import { StatusAppointment } from "@/types/enums/status-appointment.enum";
import type { Appointment } from "@/types/models/appointment";
import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { AppointmentInfoSecction } from "./appointment-info-section.component";
import { UpdateAppointmentForm, UPDATE_APPOINTMENT_FORM_ID } from "./update-appointment-form.component";
import { CreateConsultationForm, CREATE_CONSULTATION_FORM_ID } from "../consultations/create-consultation-form.component";
import { useConsultations } from "@/hooks/use-consultations";
import type { Service } from "@/types/models/service";
import type { Patient } from "@/types/models/patient";
import type { UpdateAppointmentDto } from "@/types/api/request/update-appointment.dto";
import type { CreateConsultationDto } from "@/types/api/request/create-consultation.dto";
import toast from "react-hot-toast";


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

    const { useCreateConsultation, isLoading: isSavingConsultation, error: consultationError } = useConsultations();
    const navigate = useNavigate();

    // Regla de negocio ya definida en RF-015: una consulta solo puede
    // crearse cuando la cita relacionada está en estatus "Completada".

    const canCreateConsultation = appointment.status === StatusAppointment.COMPLETADA;

    useEffect(() => {
        consultationError && toast.error(consultationError);
    }, [consultationError]);

    const handleSubmitUpdate = async (dto: UpdateAppointmentDto) => {
        const updatedAppointment = await onUpdateAppointment(appointment.id, dto);
        if (updatedAppointment) {
            setIsEditingAppointment(false);
            close(false);
        }
    };

    const handleSubmitConsultation = async (dto: CreateConsultationDto) => {
        const consultation = await useCreateConsultation(dto);
        if (consultation) {
            toast.success('Consulta registrada exitosamente');
            setIsCreatingConsultation(false);
            close(false);
            navigate('/consultas');
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
                    <CreateConsultationForm
                        appointmentId={appointment.id}
                        onSubmit={handleSubmitConsultation}
                    />

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
                            <Button type="button" variant="outline" onClick={() => setIsCreatingConsultation(false)} disabled={isSavingConsultation}>
                                Cancelar
                            </Button>

                            <Button type="submit" form={CREATE_CONSULTATION_FORM_ID} disabled={isSavingConsultation}>
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