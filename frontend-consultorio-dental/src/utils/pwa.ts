import { useSyncExternalStore } from "react";

/** Evento no estándar de Chromium: permite mostrar nuestro propio botón de instalar. */
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
let snapshot = { canPrompt: false, installed: false };

function emit() {
    snapshot = { canPrompt: deferredPrompt !== null, installed };
    listeners.forEach((listener) => listener());
}

/** Detecta si la app ya se abre como aplicación instalada (Android/escritorio y iOS). */
function isStandalone(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Se llama una sola vez al arrancar: el evento puede dispararse antes de que React monte los componentes. */
export function initPwa(): void {
    if (typeof window === "undefined") return;

    installed = isStandalone();
    snapshot = { canPrompt: false, installed };

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event as BeforeInstallPromptEvent;
        emit();
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        installed = true;
        emit();
    });

    if ("serviceWorker" in navigator) {
        if (import.meta.env.PROD) {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("/sw.js").catch(() => {
                    // Sin service worker la app sigue funcionando; solo se pierde el modo sin conexión.
                });
            });
        } else {
            // En desarrollo un service worker de otra sesión (p. ej. Docker en el mismo puerto) estorba: se quita.
            navigator.serviceWorker.getRegistrations().then((list) => list.forEach((registration) => registration.unregister()));
        }
    }

    // Tras un despliegue, una pestaña abierta con la versión anterior puede pedir un archivo que ya no existe:
    // se recarga para tomar la versión nueva en lugar de dejar la pantalla rota.
    window.addEventListener("vite:preloadError", () => window.location.reload());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const getSnapshot = () => snapshot;

/** iOS (Safari) no dispara beforeinstallprompt: la instalación es manual desde "Compartir". */
function detectIos(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return /iPad|iPhone|iPod/.test(ua) || iPadOs;
}

/** Estado y acción de instalación de la PWA para el botón "Instalar app". */
export function usePwaInstall() {
    const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const isIos = detectIos();

    const install = async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
        if (!deferredPrompt) return "unavailable";
        const prompt = deferredPrompt;
        // El evento solo sirve una vez: se descarta antes de esperar para que un doble clic no lo reutilice.
        deferredPrompt = null;
        emit();
        try {
            await prompt.prompt();
            return (await prompt.userChoice).outcome;
        } catch {
            return "unavailable";
        }
    };

    return {
        /** Hay que mostrar el botón: el navegador permite instalar, o es iOS y aún no está instalada. */
        visible: !state.installed && (state.canPrompt || isIos),
        /** En iOS no hay diálogo nativo: se muestran las instrucciones manuales. */
        needsManualSteps: !state.canPrompt && isIos,
        install,
    };
}
