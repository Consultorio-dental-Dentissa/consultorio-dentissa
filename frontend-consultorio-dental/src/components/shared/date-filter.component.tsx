import { cn } from "@/lib/utils";

interface DateFilterProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    className?: string;
}

/** Filtro de fecha de docs/DISEÑO-FINAL (Consultas): etiqueta 14.5/700 #4b5563 + campo de 44px, radio 8. Valor AAAA-MM-DD. */
export function DateFilter({ label, value, onChange, min, max, className }: DateFilterProps) {
    return (
        <label className={cn("flex w-full items-center gap-2.5 sm:w-auto", className)}>
            <span className="text-[14.5px] font-bold text-ink-3">{label}</span>
            <input
                type="date"
                value={value}
                min={min}
                max={max}
                onChange={(event) => onChange(event.target.value)}
                className="h-11 min-w-0 rounded-lg border border-input bg-surface px-3 text-[15px] text-foreground outline-none focus-visible:border-coral focus-visible:ring-3 focus-visible:ring-coral/18"
            />
        </label>
    );
}
