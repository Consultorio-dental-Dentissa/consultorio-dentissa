import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Rótulo de sección de docs/DISEÑO-FINAL ("PRÓXIMAS CITAS", "HOY"): 14px/800 #6b7280, mayúsculas, tracking .05em. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h2 className={cn("text-sm font-extrabold tracking-[0.05em] text-ink-4 uppercase", className)}>
            {children}
        </h2>
    );
}
