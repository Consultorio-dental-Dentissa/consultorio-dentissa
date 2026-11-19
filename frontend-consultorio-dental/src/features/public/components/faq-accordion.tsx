import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { PublicFaq } from "@/features/public/types/public.types";

/** Acordeón de la maqueta: tarjeta blanca radio 12, borde #fbc6cf abierta, círculo 34px con +/−; la primera abierta. */
export function FaqAccordion({ items }: { items: PublicFaq[] }) {
    const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null);
    const baseId = useId();

    return (
        <div className="flex flex-col gap-3">
            {items.map((faq) => {
                const open = openId === faq.id;
                const panelId = `${baseId}-${faq.id}`;
                return (
                    <div key={faq.id} className={cn("rounded-xl border bg-surface", open ? "border-brand-line" : "border-line")}>
                        <h3>
                            <button
                                type="button"
                                aria-expanded={open}
                                aria-controls={panelId}
                                onClick={() => setOpenId(open ? null : faq.id)}
                                className="flex w-full items-center gap-4 rounded-xl px-5 py-[18px] text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/30 sm:px-[26px] sm:py-[22px]"
                            >
                                <span className="flex-1 text-[17.5px] font-bold">{faq.question}</span>
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "flex size-[34px] shrink-0 items-center justify-center rounded-full text-[22px] font-semibold",
                                        open ? "bg-primary text-white" : "bg-fill text-ink-3",
                                    )}
                                >
                                    {open ? "−" : "+"}
                                </span>
                            </button>
                        </h3>
                        {open && (
                            <div id={panelId} className="max-w-[720px] px-5 pb-6 text-[16.5px] leading-[1.65] whitespace-pre-line text-ink-3 sm:px-[26px]">
                                {faq.response}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function FaqSkeleton() {
    return (
        <div className="flex flex-col gap-3" aria-hidden="true">
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-[68px] animate-pulse rounded-xl border border-line bg-fill" />
            ))}
        </div>
    );
}
