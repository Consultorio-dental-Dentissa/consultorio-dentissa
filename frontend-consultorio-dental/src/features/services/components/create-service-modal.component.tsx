import { Modal } from "@/components/shared/modal.component"
import { Button } from "@/components/ui/button";
import { CreateServiceForm } from "./create-service-form.component";
import { useState } from "react"

export function CreateServiceModal() {

    const [open, setOpen] = useState(false);

    return (
        <Modal
            open={open}
            onClose={setOpen}
            title="Agregar servicio"
            trigger={<Button variant="primary">Agregar servicio</Button>}
        >
            <CreateServiceForm 
                onSubmit={() => setOpen(false)}
                onCancel={() => setOpen(false)}
            />
        </Modal>
    )
}