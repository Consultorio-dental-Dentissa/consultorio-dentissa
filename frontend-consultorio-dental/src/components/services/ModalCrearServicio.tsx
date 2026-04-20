import { Modal } from '@/components/common/Modal'
import { CrearServicioForm } from '@/components/services/CrearServicioForm'
import type { CrearServicio } from '@/types/api/request/CrearServicio';

interface ModalServicioProps {
    open: boolean;
    onClose: () => void
    onSubmit: (data: CrearServicio) => Promise<void>;
}

export function ModalCrearServicio({ open, onClose, onSubmit }: ModalServicioProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Crear nuevo servicio"
            description='Porfavor llene todos los campos'
            >
            <CrearServicioForm 
                onSubmit={onSubmit}
                onCancel={onClose}
            />
        </Modal>
    )
}