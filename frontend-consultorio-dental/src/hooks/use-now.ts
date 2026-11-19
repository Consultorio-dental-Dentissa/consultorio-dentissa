import { useEffect, useState } from "react";

/** Instante actual (ms) que se actualiza cada minuto, para marcar horarios pasados sin llamar Date.now() en el render. */
export function useNow(intervalMs = 60_000): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return now;
}
