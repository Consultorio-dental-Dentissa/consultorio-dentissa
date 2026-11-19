import { CalendarPlus } from "lucide-react";
import { Modal } from "@/components/shared/modal.component";
import { CreateAppointmentForm } from "@/features/appointments/components/create-appointment-form.component";
import type { PickedPatient } from "@/features/patients/components/patient-picker.component";

interface CreateAppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    canPickPatient: boolean;
    defaultPatient?: PickedPatient;
    defaultDate?: string;
    defaultTime?: string;
}

export function CreateAppointmentModal({
    open, onOpenChange, canPickPatient, defaultPatient, defaultDate, defaultTime,
}: CreateAppointmentModalProps) {
    return (
        <Modal
            icon={CalendarPlus}
            open={open}
            onClose={onOpenChange}
            title="Agendar cita"
            description={canPickPatient ? "Registra una nueva cita para un paciente (hora del consultorio)" : "Elige el servicio y el horario (hora del consultorio)"}
        >
            <CreateAppointmentForm
                canPickPatient={canPickPatient}
                defaultPatient={defaultPatient}
                defaultDate={defaultDate}
                defaultTime={defaultTime}
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
            />
        </Modal>
    );
}
