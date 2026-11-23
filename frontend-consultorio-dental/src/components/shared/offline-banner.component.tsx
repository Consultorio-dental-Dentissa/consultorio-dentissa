import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(listener: () => void) {
    window.addEventListener("online", listener);
    window.addEventListener("offline", listener);
    return () => {
        window.removeEventListener("online", listener);
        window.removeEventListener("offline", listener);
    };
}

/** Aviso fijo cuando el dispositivo pierde la conexión: la app abre, pero los datos necesitan internet. */
export function OfflineBanner() {
    const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
    if (online) return null;

    return (
        <div
            role="status"
            className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-center text-sm font-semibold text-white"
        >
            <WifiOff className="size-4 shrink-0" aria-hidden="true" />
            Sin conexión. La aplicación abre, pero los datos necesitan internet.
        </div>
    );
}
