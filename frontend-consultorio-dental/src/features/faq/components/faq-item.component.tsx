import { useId, useState } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Faq } from "@/features/faq/types/faq.model";

interface FaqItemProps {
    faq: Faq;
    onEdit: (faq: Faq) => void;
    onDelete: (faq: Faq) => void;
    onToggleStatus: (faq: Faq, status: boolean) => void;
    togglingStatus?: boolean;
}

/** Fila acordeón de Preguntas frecuentes.dc.html: chevron, pregunta, editar, eliminar y respuesta en texto plano. */
export function FaqItem({ faq, onEdit, onDelete, onToggleStatus, togglingStatus }: FaqItemProps) {
    const [open, setOpen] = useState(false);
    const panelId = useId();

    return (
        <li className="border-b border-line-row last:border-b-0">
            <div className="flex items-center gap-4 px-6 py-[18px] hover:bg-surface-muted">
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex min-w-0 flex-1 items-center gap-4 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    <span
                        className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                            open ? "bg-brand-soft text-brand" : "bg-fill text-ink-3",
                        )}
                    >
                        <ChevronRight className={cn("size-4 stroke-[2.3] transition-transform duration-200", open && "rotate-90")} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-base font-bold">{faq.question}</span>
                </button>
                {!faq.status && <Badge variant="base" className="hidden sm:inline-flex">Borrador</Badge>}
                <Button variant="secondary" size="icon-sm" onClick={() => onEdit(faq)} aria-label={`Editar la pregunta: ${faq.question}`} title="Editar">
                    <Pencil />
                </Button>
                <Button variant="destructive" size="icon-sm" onClick={() => onDelete(faq)} aria-label={`Eliminar la pregunta: ${faq.question}`} title="Eliminar">
                    <Trash2 />
                </Button>
            </div>

            {open && (
                <div id={panelId} className="px-6 pb-5 sm:pl-[72px]">
                    <p className="text-[15px] leading-[1.7] whitespace-pre-line text-ink-3">{faq.response}</p>
                    <label className="mt-3.5 flex w-fit cursor-pointer items-center gap-2.5">
                        <Switch
                            checked={faq.status}
                            disabled={togglingStatus}
                            onCheckedChange={(value) => onToggleStatus(faq, value)}
                            aria-label="Visible en el sitio público"
                        />
                        <span className="text-[14.5px] font-semibold text-ink-2">Visible en el sitio público</span>
                    </label>
                </div>
            )}
        </li>
    );
}
