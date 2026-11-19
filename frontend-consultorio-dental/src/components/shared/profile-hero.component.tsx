import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProfileHeroMeta {
    icon: LucideIcon;
    text: string;
}

interface ProfileHeroProps {
    /** Nombre completo (h1 28/800). */
    title: string;
    /** Badge junto al nombre (estatus o rol). */
    badge?: ReactNode;
    /** Línea de datos con icono gris (edad, teléfono, correo…). */
    meta?: ProfileHeroMeta[];
    /** Bloque de métricas (caja #f7f8f9) entre los datos y las acciones. */
    aside?: ReactNode;
    /** Botones a la derecha (apilados). */
    actions?: ReactNode;
    label?: string;
}

/**
 * Cabecera de perfil de docs/DISEÑO-FINAL (Perfil de paciente / Perfil de usuario / Mi perfil): tarjeta blanca de
 * radio 12, padding 28x32, nombre 28/800 con badge, datos con icono 17px #9aa0a8 y acciones a la derecha.
 */
export function ProfileHero({ title, badge, meta, aside, actions, label = "Resumen del perfil" }: ProfileHeroProps) {
    return (
        <section
            aria-label={label}
            className="flex flex-col gap-5 rounded-xl border border-line bg-surface px-5 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-center lg:gap-8"
        >
            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.02em]">{title}</h1>
                    {badge}
                </div>
                {meta && meta.length > 0 && (
                    <ul className="flex flex-wrap gap-x-[22px] gap-y-2 text-[15px] text-ink-3">
                        {meta.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex min-w-0 items-center gap-2">
                                <Icon className="size-[17px] shrink-0 text-ink-5" strokeWidth={1.9} aria-hidden="true" />
                                <span className="break-all sm:break-normal">{text}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {aside}
            {actions && <div className={cn("flex flex-wrap gap-2.5 lg:flex-col")}>{actions}</div>}
        </section>
    );
}
