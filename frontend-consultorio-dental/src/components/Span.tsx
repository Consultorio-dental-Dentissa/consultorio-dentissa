
interface ErrorSpanProps {
    message: string
}

export function ErrorSpan({message}: ErrorSpanProps) {
    return(
        <span className="text-red-500">{message}</span>
    );
}