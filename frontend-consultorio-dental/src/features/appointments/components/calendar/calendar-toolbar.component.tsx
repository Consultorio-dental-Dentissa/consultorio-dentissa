import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SelectComponent } from "@/components/shared/select.component";
import type { CalendarView } from "@/features/appointments/components/calendar/calendar.utils";
import { formatKeyMonthYear, formatKeyShort } from "@/utils/clinic-time";

interface CalendarToolbarProps {
    view: CalendarView;
    anchor: string;
    onViewChange: (view: CalendarView) => void;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    /** Filtros (búsqueda y estatus) que se dibujan antes del selector de vista. */
    filters?: ReactNode;
}

const VIEW_OPTIONS = [
    { data: "Semana", value: "week" },
    { data: "Día", value: "day" },
    { data: "Mes", value: "month" },
];

const NAV =
    "flex size-[38px] items-center justify-center rounded-lg bg-fill text-ink-3 outline-none transition-colors hover:bg-fill-hover focus-visible:ring-3 focus-visible:ring-ring/50";

/** Barra del calendario de Citas.dc.html: mes (19/800), anterior / Hoy / siguiente, filtros y selector de vista. */
export function CalendarToolbar({ view, anchor, onViewChange, onPrev, onNext, onToday, filters }: CalendarToolbarProps) {
    const label = view === "day" ? `${formatKeyShort(anchor)} ${anchor.slice(0, 4)}` : formatKeyMonthYear(anchor);
    const unit = view === "month" ? "mes" : view === "day" ? "día" : "semana";

    return (
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-5 sm:px-6">
            <h2 className="text-[19px] font-extrabold sm:min-w-[190px]" aria-live="polite">{label}</h2>
            <button type="button" onClick={onPrev} aria-label={`Ir al ${unit} anterior`} className={NAV}>
                <ChevronLeft className="size-[17px] stroke-[2.3]" aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={onToday}
                className="h-[38px] rounded-lg bg-fill px-4 text-[14.5px] font-bold text-ink-2 outline-none transition-colors hover:bg-fill-hover focus-visible:ring-3 focus-visible:ring-ring/50"
            >
                Hoy
            </button>
            <button type="button" onClick={onNext} aria-label={`Ir al ${unit} siguiente`} className={NAV}>
                <ChevronRight className="size-[17px] stroke-[2.3]" aria-hidden="true" />
            </button>

            <div className="flex w-full flex-wrap items-center gap-2.5 lg:ml-auto lg:w-auto">
                {filters}
                <SelectComponent
                    aria-label={`Vista de citas: ${VIEW_OPTIONS.find((option) => option.value === view)?.data}`}
                    data={VIEW_OPTIONS}
                    value={view}
                    onChange={(value) => onViewChange(value as CalendarView)}
                    className="h-10 w-auto min-w-[120px] rounded-lg"
                />
            </div>
        </div>
    );
}
