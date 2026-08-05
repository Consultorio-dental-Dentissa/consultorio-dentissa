import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface ModalProps {
    open: boolean;
    onClose: (open: boolean) => void
    title?: string;
    description?: string;
    children: React.ReactNode;
    position?: 'right' | 'center';
}

export function Modal({ open, onClose, title, description, children, position }: ModalProps) {

    const styles = {
        positionStyles: '',
        layoutPositionStyles: ''
    }
    switch(position) {
        case 'right':
            styles.positionStyles = 'sm:right-0 sm:left-auto sm:mr-6 sm:max-w-[425px] sm:translate-x-0';
            styles.layoutPositionStyles = 'flex flex-col items-start';
            break;
        default:
            position = 'center';
            styles.positionStyles = 'sm:max-w-[50%]';
            styles.layoutPositionStyles = 'flex items-center'
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={styles.positionStyles}>
                <DialogHeader className={styles.layoutPositionStyles}>
                    <DialogTitle className='font-bold text-2xl'>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}