import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TONES = {
    gray: "text-foreground",
    green: "text-foreground",
    blue: "text-foreground",
    amber: "text-foreground",
    brand: "text-primary",
    violet: "text-foreground",
} as const;

interface StatCardProps {
    title: string;
    value?: number | string;
    /** Se conserva por compatibilidad: las tarjetas de métricas de docs/DISEÑO-FINAL no llevan icono. */
    icon?: LucideIcon;
    /** `brand` resalta la cifra en rosa #fc7186 (la métrica destacada de cada maqueta); el resto usa #1f2328. */
    tone?: keyof typeof TONES;
    isLoading?: boolean;
    /** Línea de contexto bajo la cifra (p. ej. "2 completadas, 1 en curso"). */
    hint?: string;
    /** `panel` = tarjeta del Panel (radio 12, etiqueta/cifra/nota con separación de 6px); por defecto la de los listados (radio 10). */
    variant?: "list" | "panel";
}

/** Tarjeta de métrica de docs/DISEÑO-FINAL: borde #e5e7eb, etiqueta 14.5/600 #6b7280, cifra 32/800. */
export function StatCard({ title, value, tone = "gray", isLoading, hint, variant = "list" }: StatCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col border border-line bg-surface px-[22px] py-5",
                variant === "panel" ? "gap-1.5 rounded-xl" : "rounded-[10px]",
            )}
        >
            <p className="text-[14.5px] leading-snug font-semibold text-ink-4">{title}</p>
            {isLoading ? (
                <Skeleton className="mt-1.5 h-[38px] w-16" />
            ) : (
                <p
                    className={cn(
                        "text-[32px] leading-[1.2] font-extrabold",
                        variant === "list" && "mt-1.5",
                        TONES[tone],
                    )}
                >
                    {value ?? "—"}
                </p>
            )}
            {hint && !isLoading && <p className="text-sm text-ink-4">{hint}</p>}
        </div>
    );
}
