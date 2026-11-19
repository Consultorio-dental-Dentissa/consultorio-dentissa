import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description?: string;
    /** Se conserva por compatibilidad: las maquetas muestran el estado vacío solo con texto. */
    icon?: LucideIcon;
    action?: ReactNode;
}

/** Estado vacío de docs/DISEÑO-FINAL: título 17/800 + texto 15px #6b7280, centrados, sin icono. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-14 text-center">
            <p className="text-[17px] font-extrabold">{title}</p>
            {description && <p className="max-w-md text-[15px] text-ink-4">{description}</p>}
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}
