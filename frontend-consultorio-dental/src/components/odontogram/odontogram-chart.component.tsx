import { useMemo } from "react";
import type { Tooth } from "@/types/models/tooth";
import { ToothStatus } from "@/types/enums/tooth-status.enum";
import { getToothStatusOption, TOOTH_STATUS_OPTIONS } from "./tooth-status.config";
import { cn } from "@/lib/utils";

interface OdontogramChartProps {
    teeth: Tooth[];
    onSelectTooth: (tooth: Tooth) => void;
}

const UPPER_ARCH = Array.from({ length: 16 }, (_, i) => i + 1);
const LOWER_ARCH = Array.from({ length: 16 }, (_, i) => 32 - i);

const LIGHT_BACKGROUND_STATUSES: ToothStatus[] = [ToothStatus.SANO, ToothStatus.AUSENTE];

export function OdontogramChart({ teeth, onSelectTooth }: OdontogramChartProps) {

    const teethByNumber = useMemo(() => {
        const map = new Map<number, Tooth>();
        teeth.forEach(tooth => map.set(tooth.number, tooth));
        return map;
    }, [teeth]);

    const renderRow = (numbers: number[]) => (
        <div className="flex flex-row gap-2 justify-center">
            {numbers.map(number => {
                const tooth = teethByNumber.get(number);
                if (!tooth) return null;

                const statusOption = getToothStatusOption(tooth.status);

                return (
                    <button
                        key={number}
                        type="button"
                        onClick={() => onSelectTooth(tooth)}
                        title={`Diente ${number} - ${statusOption.label}`}
                        className={cn(
                            "flex items-center justify-center w-9 h-11 rounded-md border border-gray-300 text-[11px] font-medium transition hover:scale-105",
                            statusOption.color,
                            LIGHT_BACKGROUND_STATUSES.includes(tooth.status) ? 'text-gray-700' : 'text-white'
                        )}
                    >
                        {number}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
                {renderRow(UPPER_ARCH)}
                {renderRow(LOWER_ARCH)}
            </div>

            <div className="flex flex-row flex-wrap gap-4 justify-center border-t pt-3">
                {TOOTH_STATUS_OPTIONS.map(option => (
                    <div key={option.value} className="flex items-center gap-1.5">
                        <span className={cn("w-3.5 h-3.5 rounded-sm border border-gray-300", option.color)} />
                        <span className="text-xs font-medium text-gray-600">{option.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
