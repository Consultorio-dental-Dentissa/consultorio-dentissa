import { CreateAppointmentForm } from "./create-appointment-form.component";
import { Modal } from "@/components/shared/modal.component";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CreateAppointmentModal() {

    const [openModal, setOpenModal] = useState(false);

    return (
        <Modal
            title="Agendar cita"
            open={openModal}
            onClose={setOpenModal}
            trigger={<Button variant="primary">Agendar cita</Button>}
        >
            <CreateAppointmentForm 
               onSubmit={() => setOpenModal(false)}
               onCancel={() => setOpenModal(false)}
            />
        </Modal>
    );
}