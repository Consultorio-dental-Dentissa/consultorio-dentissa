import CreateUserForm from '@/components/users/create-user-form.component';
import { Modal } from '@/components/common/modal.component'
import type { CreateUserDto } from '@/types/api/request/create-user.dto';

interface CreateUserModalProps {
    open: boolean;
    onClose: () => void
    onSubmit: (data: CreateUserDto) => void;
}

export function CreateUserModal({ open, onClose, onSubmit }: CreateUserModalProps) {

    return (
        <Modal 
            title='Registrar nuevo usuario'
            description='Porfavor llena todos los campos'
            open={open}
            onClose={onClose}>
                <CreateUserForm 
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
        </Modal>
    );
}