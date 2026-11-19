import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface InfoRowProps {
    label: string;
    value: ReactNode;
    /** Se conserva por compatibilidad: en las tarjetas de datos de las maquetas los campos no llevan icono. */
    icon?: LucideIcon;
}

/** Par etiqueta/valor de docs/DISEÑO-FINAL (tarjetas de datos): etiqueta 13.5/600 #6b7280 + valor 16/700. */
export function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <dt className="text-[13.5px] font-semibold text-ink-4">{label}</dt>
            <dd className="text-base font-bold break-words text-foreground">{value || "—"}</dd>
        </div>
    );
}
