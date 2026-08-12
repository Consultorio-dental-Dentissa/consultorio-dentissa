import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'

interface ModalProps {
    open: boolean;
    onClose: (open: boolean) => void
    title?: string;
    description?: string;
    children: React.ReactNode;
    trigger?: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, trigger }: ModalProps) {


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='font-bold text-2xl text-center'>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}