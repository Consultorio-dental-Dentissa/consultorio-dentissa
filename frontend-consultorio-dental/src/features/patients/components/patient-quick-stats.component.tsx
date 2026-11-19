import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { clinicDayKey, formatKeyShort } from "@/utils/clinic-time";
import type { PatientSummary } from "@/features/patients/hooks/use-patient-summary";

/** "10 nov" en la zona del consultorio. */
const dayMonth = (date: Date) => formatKeyShort(clinicDayKey(date));

function QuickStat({
    label, value, loading, brand, divider,
}: { label: string; value: string | number; loading: boolean; brand?: boolean; divider: boolean }) {
    return (
        <div className={cn("flex min-w-0 flex-1 flex-col gap-1 px-3 sm:px-6 lg:min-w-[118px] lg:whitespace-nowrap", divider && "border-l border-line")}>
            <dt className="text-[13.5px] font-semibold text-ink-4">{label}</dt>
            {loading ? (
                <Skeleton className="h-[26px] w-14" />
            ) : (
                <dd className={cn("text-[21px] leading-tight font-extrabold", brand ? "text-brand" : "text-foreground")}>{value}</dd>
            )}
        </div>
    );
}

/** Caja de métricas del perfil (Perfil de paciente.dc.html): Citas totales, Última visita y Próxima cita (rosa). */
export function PatientQuickStats({ summary }: { summary: PatientSummary }) {
    const loading = summary.isPending;

    return (
        <dl className="flex rounded-xl bg-[#f7f8f9] py-3.5 lg:shrink-0" aria-label="Resumen de citas">
            <QuickStat label="Citas totales" value={summary.total ?? "—"} loading={loading} divider={false} />
            <QuickStat
                label="Última visita"
                value={summary.lastVisit ? dayMonth(summary.lastVisit.scheduled_at) : "—"}
                loading={loading} divider
            />
            <QuickStat
                label="Próxima cita"
                value={summary.next ? dayMonth(summary.next.scheduled_at) : "—"}
                loading={loading} brand divider
            />
        </dl>
    );
}
