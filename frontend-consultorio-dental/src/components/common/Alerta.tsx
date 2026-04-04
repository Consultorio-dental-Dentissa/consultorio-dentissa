import toast from "react-hot-toast";

export function SuccessToast(message: string) {
    toast.success(message, {
        style: {
            backgroundColor: '#4ABD42',
            color: 'white'
        },
        iconTheme: {
            primary: '#ffffffff',
            secondary: '#4ABD42',
        },
    })
}

export function ErrorToast(message: string) {
    toast.error(message, {
        style: {
            backgroundColor: '#dd3737ff',
            color: 'white'
        },
        iconTheme: {
            primary: '#ffffffff',
            secondary: '#dd3737ff',
        },
    })
}