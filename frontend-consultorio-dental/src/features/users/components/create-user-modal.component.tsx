import { CreateUserForm } from "@/features/users/components/create-user-form.component";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/modal.component";
import { useState } from "react";

export function CreateUserModal() {

    const [openModal, setOpenModal] = useState(false);

    return (
        <Modal
            title="Registrar usuario"
            open={openModal}
            onClose={setOpenModal}
            trigger={<Button variant="primary">Registrar usuario</Button>}
        >
            <CreateUserForm 
               onSubmit={() => setOpenModal(false)}
               onCancel={() => setOpenModal(false)}
            />
        </Modal>
    );
}