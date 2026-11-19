import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Modal } from "@/components/shared/modal.component";

interface DrawerProps {
    open: boolean;
    onClose: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    icon?: LucideIcon;
}

/**
 * Edición en panel. Las maquetas de docs/DISEÑO resuelven todas las ediciones en
 * un modal centrado, así que este componente delega en `Modal` para mantener un
 * único lenguaje visual (conserva el nombre para no tocar a los consumidores).
 */
export function Drawer({ open, onClose, title, description, children, icon }: DrawerProps) {
    return (
        <Modal open={open} onClose={onClose} title={title} description={description} icon={icon}>
            {children}
        </Modal>
    );
}
