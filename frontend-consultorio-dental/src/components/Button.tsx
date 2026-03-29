import { Button } from '@/components/ui/button'

interface ButtonProps {
    message: string
    type?: "button" | "submit" | "reset"
    disabled?: boolean
    onClick?: () => void
}

export function PrimaryButton({ message, type, onClick, disabled}: ButtonProps) {
    return (
        <Button className='p-5 bg-rose-500 rounded-sm' type={type} onClick={onClick}>
            {message}
        </Button>
    )
}

export function SecondaryButton({ message, type, onClick }: ButtonProps) {
    return (
        <Button className='p-5 bg-zinc-500 rounded-sm' type={type} onClick={onClick}>
            {message}
        </Button>
    )
}