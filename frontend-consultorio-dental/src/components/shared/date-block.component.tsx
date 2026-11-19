import { cn } from "@/lib/utils";

interface DateBlockProps {
    day: string;
    /** Mes abreviado (se muestra en mayúsculas). */
    month: string;
    /** `brand` = próxima (rosa suave #fff1f3 / #e0566c); `muted` = pasada (#f4f5f7 / #1f2328); `solid` = destacada (#fc7186 / blanco). */
    tone?: "brand" | "muted" | "solid";
    className?: string;
}

const TONES = {
    brand: "bg-brand-soft text-brand",
    muted: "bg-background text-foreground",
    solid: "h-[76px] w-[72px] rounded-xl bg-primary text-white",
} as const;

/** Bloque de fecha de docs/DISEÑO-FINAL (Mis citas, Perfil de paciente): 56x58, radio 10, día 21/800 + mes 12/800 en mayúsculas. */
export function DateBlock({ day, month, tone = "brand", className }: DateBlockProps) {
    return (
        <div
            className={cn(
                "flex h-[58px] w-14 shrink-0 flex-col items-center justify-center rounded-[10px]",
                TONES[tone],
                className,
            )}
        >
            <span className={cn("leading-none font-extrabold", tone === "solid" ? "text-[28px]" : "text-[21px]")}>{day}</span>
            <span className={cn("mt-[3px] text-xs font-extrabold uppercase", tone === "muted" && "text-ink-4", tone === "solid" && "mt-1 text-[13px]")}>
                {month}
            </span>
        </div>
    );
}
