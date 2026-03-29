import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog'
import UsuarioForm from '@/components/formularios/UsuarioForm';
import type { CrearUsuario } from '@/types/api/request/CrearUsuario';

interface ModalUsuarioProps {
    open: boolean;
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CrearUsuario) => void;
}

export function ModalUsuario({ open, onOpenChange, onSubmit }: ModalUsuarioProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader className='flex items-center'>
                    <DialogTitle className='font-bold text-xl'>Registrar usuario</DialogTitle>
                    <DialogDescription>Porfavor llena todos los campos</DialogDescription>
                </DialogHeader>
                <UsuarioForm onSubmit={onSubmit} onCancel={() => {onOpenChange(false); console.log("Se ejecuta cerrar")}} />
            </DialogContent>
        </Dialog>
    )
}