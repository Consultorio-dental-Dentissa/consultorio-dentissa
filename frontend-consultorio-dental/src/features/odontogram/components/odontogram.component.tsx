import { useState } from "react";
import { ErrorState } from "@/components/shared/error-state.component";
import { Skeleton } from "@/components/ui/skeleton";
import { useOdontogram } from "@/features/odontogram/hooks/use-odontogram";
import { ToothEditModal } from "@/features/odontogram/components/tooth-edit-modal.component";
import {
    LOWER_LEFT, LOWER_RIGHT, TOOTH_STATUS_LIST, TOOTH_STATUS_STYLE, UPPER_LEFT, UPPER_RIGHT, type Tooth,
} from "@/features/odontogram/types/odontogram.model";

interface OdontogramProps {
    patientId: number;
    /** Solo lectura: los dientes no abren el editor. */
    readOnly?: boolean;
    /** Permite diferir la consulta (p. ej. sección colapsada). */
    enabled?: boolean;
    /** Dónde se muestra la leyenda de estados; por defecto debajo de las arcadas. */
    legendPosition?: "top" | "bottom";
}

/**
 * Odontograma FDI de 32 dientes dibujado con SVG propio. Colores por estado:
 * SANO blanco, CARIES negro, REMOVIDO rojo, CORONA dorado. Solo ADMIN (el backend responde 403 al resto).
 */
export function Odontogram({ patientId, readOnly = false, enabled = true, legendPosition = "bottom" }: OdontogramProps) {
    const query = useOdontogram(patientId, enabled);
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

    if (query.isPending) {
        return (
            <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando odontograma">
                <Skeleton className="h-[120px] w-full" />
                <Skeleton className="h-[120px] w-full" />
            </div>
        );
    }

    if (query.isError) {
        return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
    }

    const byNumber = new Map(query.data.teeth.map((tooth) => [tooth.tooth_number, tooth]));
    const selected = selectedNumber !== null ? byNumber.get(selectedNumber) ?? null : null;

    const renderArch = (left: number[], right: number[], label: string) => (
        <div role="group" aria-label={label} className="flex items-center gap-3">
            {[left, right].map((quadrant, index) => (
                <div key={index} className={`flex flex-1 gap-1 ${index === 0 ? "border-r border-line-soft pr-3" : ""}`}>
                    {quadrant.map((number) => {
                        const tooth = byNumber.get(number);
                        return tooth ? (
                            <ToothButton
                                key={number}
                                tooth={tooth}
                                readOnly={readOnly}
                                onSelect={() => setSelectedNumber(number)}
                            />
                        ) : null;
                    })}
                </div>
            ))}
        </div>
    );

    const legend = (
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Leyenda de estados">
                {TOOTH_STATUS_LIST.map((status) => {
                    const style = TOOTH_STATUS_STYLE[status];
                    return (
                        <li key={status} className="flex items-center gap-2 text-sm font-semibold text-ink-3">
                            <span
                                aria-hidden="true"
                                className="size-4 rounded-full border-2"
                                style={{ backgroundColor: style.fill, borderColor: style.stroke }}
                            />
                            {style.label}
                        </li>
                    );
                })}
                <li className="flex items-center gap-2 text-sm font-semibold text-ink-3">
                    <span aria-hidden="true" className="size-3 rounded-full border-2 border-white bg-primary ring-1 ring-input" />
                    Con nota
                </li>
            </ul>
    );

    return (
        <div className="flex flex-col gap-4">
            {legendPosition === "top" && legend}

            <div className="overflow-x-auto pb-1">
                <div className="flex min-w-[600px] flex-col gap-5">
                    {renderArch(UPPER_LEFT, UPPER_RIGHT, "Arcada superior")}
                    {renderArch(LOWER_LEFT, LOWER_RIGHT, "Arcada inferior")}
                </div>
            </div>

            {legendPosition === "bottom" && legend}

            {!readOnly && <p className="text-sm text-ink-4">Selecciona un diente para cambiar su estado o agregar una nota.</p>}

            {!readOnly && <ToothEditModal patientId={patientId} tooth={selected} onClose={() => setSelectedNumber(null)} />}
        </div>
    );
}

function describeTooth(tooth: Tooth): string {
    const label = TOOTH_STATUS_STYLE[tooth.status].label;
    return `Diente ${tooth.tooth_number}, ${label}${tooth.notes ? ", con nota" : ""}`;
}

function ToothButton({ tooth, readOnly, onSelect }: {
    tooth: Tooth; readOnly: boolean; onSelect: () => void;
}) {
    const style = TOOTH_STATUS_STYLE[tooth.status];
    const title = tooth.notes ? `${describeTooth(tooth)}: ${tooth.notes}` : describeTooth(tooth);

    return (
        <button
            type="button"
            onClick={readOnly ? undefined : onSelect}
            aria-label={describeTooth(tooth)}
            title={title}
            aria-disabled={readOnly || undefined}
            tabIndex={readOnly ? -1 : 0}
            className={`min-w-0 flex-1 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                readOnly ? "cursor-default" : "cursor-pointer transition-transform hover:-translate-y-0.5"
            }`}
        >
            <svg viewBox="0 0 40 40" className="block h-auto w-full" aria-hidden="true" focusable="false">
                <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill={style.fill} stroke={style.stroke} strokeWidth="1" />
                <text
                    x="20"
                    y="20.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                    fontWeight="700"
                    fill={style.text}
                >
                    {tooth.tooth_number}
                </text>
                {tooth.notes && <circle cx="31" cy="9" r="3.5" fill="#fc7186" stroke="#ffffff" strokeWidth="1.2" />}
            </svg>
        </button>
    );
}
