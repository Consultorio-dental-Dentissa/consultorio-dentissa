import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog'

interface ModalProps {
    open: boolean;
    onClose: (open: boolean) => void
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[50%]">
                <DialogHeader className='flex items-center'>
                    <DialogTitle className='font-bold text-xl'>{ title }</DialogTitle>
                    <DialogDescription>{ description }</DialogDescription>
                </DialogHeader>
                { children }
            </DialogContent>
        </Dialog>
    )
}