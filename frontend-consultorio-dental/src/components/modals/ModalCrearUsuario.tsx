import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog'
import UsuarioForm from '@/components/formularios/UsuarioForm';

interface ModalUsuarioProps {
    open: boolean;
    onOpenChange: (open: boolean) => void
    onSubmit: () => void;
}

export function ModalUsuario({ open, onOpenChange, onSubmit }: ModalUsuarioProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className='font-bold'>Registrar usuario</DialogTitle>
                    <DialogDescription>Porfavor llena todos los campos</DialogDescription>
                </DialogHeader>
                <UsuarioForm onSubmit={onSubmit} onCancel={() => {onOpenChange(false); console.log("Se ejecuta cerrar")}} />
            </DialogContent>
        </Dialog>
    )
}