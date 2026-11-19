import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
    title: string;
    icon?: LucideIcon;
    children: ReactNode;
    className?: string;
}

/**
 * Tarjeta de datos de docs/DISEÑO-FINAL (Perfil de usuario/paciente, "Información personal", "Contacto"):
 * borde #e5e7eb, radio 12, padding 24x26, cabecera con icono rosa en cuadro #fff1f3 de 38px y título 17/800.
 * Los hijos suelen ser `InfoRow`.
 */
export function InfoCard({ title, icon: Icon, children, className }: InfoCardProps) {
    return (
        <section className={cn("flex flex-col gap-5 rounded-xl border border-line bg-surface px-[26px] py-6", className)}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <span className="flex size-[38px] items-center justify-center rounded-[10px] bg-brand-soft text-brand">
                        <Icon className="size-[19px]" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                )}
                <h2 className="text-[17px] font-extrabold">{title}</h2>
            </div>
            <dl className="flex flex-col gap-4">{children}</dl>
        </section>
    );
}
