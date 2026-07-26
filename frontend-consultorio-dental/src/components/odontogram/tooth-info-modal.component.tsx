import { Modal } from "@/components/common/modal.component"
import { Button } from "@/components/ui/button"
import type { Tooth } from "@/types/models/tooth";
import type { UpdateToothDto } from "@/types/api/request/update-tooth.dto";
import { UpdateToothForm, UPDATE_TOOTH_FORM_ID } from "./update-tooth-form.component";

interface ToothInfoModalProps {
    open: boolean;
    close: (open: boolean) => void;
    tooth: Tooth;
    onUpdateTooth: (id: number, dto: UpdateToothDto) => Promise<Tooth | null>;
    isSaving: boolean;
}

export function ToothInfoModal({ open, close, tooth, onUpdateTooth, isSaving }: ToothInfoModalProps) {

    const handleSubmitUpdate = async (dto: UpdateToothDto) => {
        const updatedTooth = await onUpdateTooth(tooth.id, dto);
        if (updatedTooth) {
            close(false);
        }
    };

    return (
        <Modal
            title={`Diente ${tooth.number}`}
            description="Estatus y observaciones clínicas de este diente"
            position="center"
            open={open}
            onClose={close}
        >
            <UpdateToothForm
                tooth={tooth}
                onSubmit={handleSubmitUpdate}
            />

            <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => close(false)} disabled={isSaving}>
                    Cancelar
                </Button>

                <Button type="submit" form={UPDATE_TOOTH_FORM_ID} disabled={isSaving}>
                    Guardar cambios
                </Button>
            </div>
        </Modal>
    )
}
