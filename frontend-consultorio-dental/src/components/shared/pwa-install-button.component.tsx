import { useState } from "react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/shared/modal.component";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePwaInstall } from "@/utils/pwa";

interface PwaInstallButtonProps {
    className?: string;
    /** Se ejecuta tras pulsar (p. ej. para cerrar el menú móvil). */
    onClick?: () => void;
}

/**
 * Botón "Instalar app" del menú público. En Chrome/Edge/Android dispara directamente la instalación y solo existe
 * mientras la app NO esté instalada. En iOS, donde Safari no permite instalar desde código, abre los pasos de Safari.
 */
export function PwaInstallButton({ className, onClick }: PwaInstallButtonProps) {
    const { visible, needsManualSteps, pending, install } = usePwaInstall();
    const [stepsOpen, setStepsOpen] = useState(false);

    if (!visible) return null;

    const handleClick = async () => {
        onClick?.();
        if (needsManualSteps) {
            setStepsOpen(true);
            return;
        }
        const outcome = await install();
        if (outcome === "accepted") toast.success("Instalando Dentissa en tu dispositivo");
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={pending}
                className={cn(
                    "flex h-[46px] items-center justify-center gap-2 rounded-[9px] border border-input px-[18px] text-[15.5px] font-bold text-foreground transition-[box-shadow,border-color] duration-[250ms] outline-none disabled:pointer-events-none disabled:opacity-60 hover:border-primary hover:shadow-glow focus-visible:ring-3 focus-visible:ring-ring/30",
                    className,
                )}
            >
                <Download className="size-[18px]" aria-hidden="true" />
                Instalar app
            </button>

            <Modal open={stepsOpen} onClose={setStepsOpen} title="Instalar Dentissa" description="Añádela a tu pantalla de inicio" size="sm">
                <ol className="flex list-decimal flex-col gap-3 pl-5 text-[15.5px] leading-relaxed text-ink-2">
                    <li>Abre esta página en <strong>Safari</strong>.</li>
                    <li>Toca el botón <strong>Compartir</strong> (el cuadro con una flecha hacia arriba).</li>
                    <li>Elige <strong>Añadir a pantalla de inicio</strong> y confirma con <strong>Añadir</strong>.</li>
                </ol>
                <div className="form-footer mt-6">
                    <Button type="button" onClick={() => setStepsOpen(false)}>Entendido</Button>
                </div>
            </Modal>
        </>
    );
}
