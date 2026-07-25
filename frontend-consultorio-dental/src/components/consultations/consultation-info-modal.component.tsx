import { Modal } from "@/components/common/modal.component"
import { Button } from "@/components/ui/button"
import type { Consultation } from "@/types/models/consultation";
import type { UpdateConsultationDto } from "@/types/api/request/update-consultation.dto";
import { useState } from "react";
import { ConsultationInfoSection } from "./consultation-info-section.component";
import { UpdateConsultationForm, UPDATE_CONSULTATION_FORM_ID } from "./update-consultation-form.component";

interface ConsultationInfoModalProps {
    open: boolean;
    close: (open: boolean) => void;
    consultation: Consultation;
    onUpdateConsultation: (id: number, dto: UpdateConsultationDto) => Promise<Consultation | null>;
    isSaving: boolean;
}

export function ConsultationInfoModal({ open, close, consultation, onUpdateConsultation, isSaving }: ConsultationInfoModalProps) {

    const [isEditing, setIsEditing] = useState(false);

    const handleSubmitUpdate = async (dto: UpdateConsultationDto) => {
        const updatedConsultation = await onUpdateConsultation(consultation.id, dto);
        if (updatedConsultation) {
            setIsEditing(false);
            close(false);
        }
    };

    return (
        <Modal
            title="Información de la consulta"
            description="Detalles completos de la consulta seleccionada"
            position="center"
            open={open}
            onClose={close}
        >
            {
                isEditing ?
                    <UpdateConsultationForm
                        consultation={consultation}
                        onSubmit={handleSubmitUpdate}
                    />

                    :

                    <ConsultationInfoSection
                        consultation={consultation}
                        onEdit={() => setIsEditing(true)}
                    />
            }

            {
                isEditing &&
                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                        Cancelar
                    </Button>

                    <Button type="submit" form={UPDATE_CONSULTATION_FORM_ID} disabled={isSaving}>
                        Guardar cambios
                    </Button>
                </div>
            }
        </Modal>
    )
}
