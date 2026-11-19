import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

/** Cabecera de página de docs/DISEÑO-FINAL: título 28/800 (-0.02em), descripción 15px #6b7280, acción primaria a la derecha. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.02em]">{title}</h1>
                {description && <p className="text-[15px] text-ink-4">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
    );
}
