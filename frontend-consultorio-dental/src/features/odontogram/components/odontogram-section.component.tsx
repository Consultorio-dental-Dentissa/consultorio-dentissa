import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Odontogram } from "@/features/odontogram/components/odontogram.component";

/** Sección colapsable "Odontograma del paciente" para los modales de consulta (solo ADMIN). */
export function OdontogramSection({ patientId }: { patientId: number }) {
    const [open, setOpen] = useState(false);
    const panelId = useId();

    return (
        <section className="rounded-[10px] border border-line">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-3 rounded-[10px] px-4 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            >
                <span className="text-sm font-extrabold tracking-[0.05em] text-ink-4 uppercase">Odontograma del paciente</span>
                <ChevronDown className={`size-5 shrink-0 text-ink-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {open && (
                <div id={panelId} className="flex flex-col gap-3 border-t border-line-soft px-4 py-4">
                    <p className="text-sm text-ink-4">
                        Cada cambio en un diente se guarda al instante; es independiente de guardar la consulta.
                    </p>
                    <Odontogram patientId={patientId} />
                </div>
            )}
        </section>
    );
}
