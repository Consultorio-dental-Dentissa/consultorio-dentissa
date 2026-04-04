import CrearUsuarioForm from '@/components/formularios/CrearUsuarioForm';
import { Modal } from '@/components/common/Modal'
import type { CrearUsuario } from '@/types/api/request/CrearUsuario';

interface ModalCrearUsuarioProps {
    open: boolean;
    onClose: () => void
    onSubmit: (data: CrearUsuario) => void;
}

export function ModalCrearUsuario({ open, onClose, onSubmit }: ModalCrearUsuarioProps) {

    return (
        <Modal 
            title='Registrar nuevo usuario'
            description='Porfavor llena todos los campos'
            open={open}
            onClose={onClose}>
                <CrearUsuarioForm 
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
        </Modal>
    );
}