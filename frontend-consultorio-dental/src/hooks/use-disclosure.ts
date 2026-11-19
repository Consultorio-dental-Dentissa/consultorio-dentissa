import { useCallback, useState } from "react";

/** Estado abierto/cerrado para modales, drawers y diálogos. */
export function useDisclosure(initial = false) {
    const [open, setOpen] = useState(initial);
    const show = useCallback(() => setOpen(true), []);
    const hide = useCallback(() => setOpen(false), []);

    return { open, show, hide, setOpen };
}
