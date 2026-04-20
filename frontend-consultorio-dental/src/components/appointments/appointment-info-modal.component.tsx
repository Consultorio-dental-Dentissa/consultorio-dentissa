import { Modal } from "@/components/common/modal.component"
import { Separator } from "@/components/ui/separator"

import type { Appointment } from "@/types/models/appointment";
import { StatusSpan } from "@/components/common/span.component";

interface AppointmentInfoModalProps {
    open: boolean;
    close: (open: boolean) => void;
    appointment: Appointment
}

export function AppointmentInfoModal({ open, close, appointment }: AppointmentInfoModalProps) {

    const fullName = `${appointment.patient.name} ${appointment.patient.lastname}`;

    return (
        <Modal
            title="Información de la cita"
            description="Detalles completos de la cita seleccionada"
            position="right"
            open={open}
            onClose={close}
        >
            <div className="space-y-6">

                {/* Paciente */}
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Paciente</p>
                    <p className="text-base font-medium">{fullName}</p>
                </div>

                <Separator />

                {/* Servicio */}
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Servicio</p>
                    <p className="text-base font-medium">{appointment.service.name}</p>
                </div>

                {/* Grid de detalles */}
                <div className="grid grid-cols-2 gap-4">

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Duración</p>
                        <p className="font-medium">{appointment.durationMinutes} min</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <StatusSpan
                            status={appointment.status}>
                        </StatusSpan>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Fecha</p>
                        <p className="font-medium">
                            {appointment.date.toLocaleDateString()}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Hora</p>
                        <p className="font-medium">{appointment.time}</p>
                    </div>

                </div>

                <Separator />

                {/* Notas */}
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="text-sm leading-relaxed">
                        {appointment.notes || "Sin notas"}
                    </p>
                </div>

            </div>
        </Modal>
    )
}