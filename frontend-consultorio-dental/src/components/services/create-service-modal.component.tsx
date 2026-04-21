import { Modal } from '@/components/common/modal.component'
import { CreateServiceForm } from '@/components/services/create-service-form.component'
import type { CreateServiceDto } from '@/types/api/request/create-service.dto';

interface CreateServiceModalProps {
    open: boolean;
    onClose: () => void
    onSubmit: (data: CreateServiceDto) => Promise<void>;
}

export function CreateServiceModal({ open, onClose, onSubmit }: CreateServiceModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Crear nuevo servicio"
            description='Porfavor llene todos los campos'
            >
            <CreateServiceForm 
                onSubmit={onSubmit}
                onCancel={onClose}
            />
        </Modal>
    )
}