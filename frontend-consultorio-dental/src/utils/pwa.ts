import { useSyncExternalStore } from "react";

/** Evento no estándar de Chromium: permite mostrar nuestro propio botón de instalar. */
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
/** El diálogo nativo está abierto: el botón sigue visible (deshabilitado) hasta que el usuario decida. */
let pending = false;
const listeners = new Set<() => void>();
let snapshot = { canPrompt: false, installed: false, pending: false };

function emit() {
    snapshot = { canPrompt: deferredPrompt !== null, installed, pending };
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
    snapshot = { canPrompt: false, installed, pending };

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event as BeforeInstallPromptEvent;
        // Si el navegador ofrece instalar, la app no está instalada (p. ej. se desinstaló después de instalarla).
        installed = false;
        emit();
    });

    // Al abrir la app instalada o cambiar de modo de visualización se actualiza el estado.
    window.matchMedia("(display-mode: standalone)").addEventListener("change", (event) => {
        installed = event.matches;
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
        // Si el usuario cierra el diálogo sin instalar, el navegador vuelve a disparar `beforeinstallprompt` y el
        // botón reaparece listo para instalar (ver `initPwa`).
        deferredPrompt = null;
        pending = true;
        emit();
        try {
            await prompt.prompt();
            const { outcome } = await prompt.userChoice;
            if (outcome === "accepted") installed = true;
            return outcome;
        } catch {
            return "unavailable";
        } finally {
            pending = false;
            emit();
        }
    };

    return {
        /** Hay que mostrar el botón: el navegador permite instalar, o es iOS y aún no está instalada. */
        // Chromium solo dispara `beforeinstallprompt` cuando la app NO está instalada: sin evento (ya instalada) el
        // botón no aparece; tras desinstalarla el navegador vuelve a disparar el evento y el botón regresa.
        // iOS no tiene ese evento ni API de instalación: el botón explica los pasos de Safari.
        visible: !state.installed && (state.canPrompt || state.pending || isIos),
        /** Diálogo nativo abierto: el botón no debe poder pulsarse otra vez. */
        pending: state.pending,
        needsManualSteps: !state.canPrompt && isIos,
        install,
    };
}
