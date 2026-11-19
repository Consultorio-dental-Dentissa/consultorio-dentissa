import { useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header.component";
import { StatCard } from "@/components/shared/stat-card.component";
import { DataTable } from "@/components/shared/data-table.component";
import { SearchInput } from "@/components/shared/input.component";
import { DateFilter } from "@/components/shared/date-filter.component";
import { TableCard, TableToolbar } from "@/components/shared/table-card.component";
import { Button } from "@/components/ui/button";
import { useConsultations } from "@/features/consultations/hooks/use-consultations";
import { getConsultationColumns } from "@/features/consultations/components/consultations-columns.component";
import { ConsultationDetailModal } from "@/features/consultations/components/consultation-detail-modal.component";
import { ConsultationCard } from "@/features/consultations/components/consultation-card.component";
import { CreateConsultationModal } from "@/features/consultations/components/create-consultation-modal.component";
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useDisclosure } from "@/hooks/use-disclosure";
import { usePagination } from "@/hooks/use-pagination";
import { addDays, clinicTodayKey, startOfMonth, startOfWeek } from "@/utils/clinic-time";
import type { Consultation } from "@/features/consultations/types/consultation.model";

/** Consultas (solo ADMIN): registros clínicos generados a partir de citas completadas. */
export default function ConsultationsPage() {
    const { search, setSearch, debouncedSearch } = useDebouncedSearch();
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const { page, limit, setPage, resetPage } = usePagination();

    const [detailId, setDetailId] = useState<number | null>(null);
    const createDialog = useDisclosure();

    const invalidRange = from !== "" && to !== "" && from > to;
    const query = useConsultations(
        { page, limit, search: debouncedSearch, from, to },
        !invalidRange,
    );

    // Tarjetas con totales reales del servidor (limit=1, solo se usa `total`).
    const totalQuery = useConsultations({ limit: 1 });
    const monthQuery = useConsultations({ limit: 1, from: startOfMonth(clinicTodayKey()) });
    const weekQuery = useConsultations({ limit: 1, from: startOfWeek(clinicTodayKey()), to: addDays(startOfWeek(clinicTodayKey()), 6) });
    const completedQuery = useAppointments({ limit: 1, status: STATUS_APPOINTMENT.COMPLETADA });
    const pending =
        completedQuery.data && totalQuery.data ? Math.max(completedQuery.data.total - totalQuery.data.total, 0) : undefined;

    const columns = useMemo(() => getConsultationColumns((consultation: Consultation) => setDetailId(consultation.id)), []);
    const hasFilters = debouncedSearch !== "" || from !== "" || to !== "";
    const total = query.data?.total;

    return (
        <>
            <PageHeader
                title="Consultas"
                description="Las consultas se registran desde una cita con estatus «Completada»."
                actions={<Button onClick={createDialog.show}>+ Registrar consulta</Button>}
            />

            <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
                <StatCard title="Total registradas" value={totalQuery.data?.total} isLoading={totalQuery.isPending} />
                <StatCard title="Este mes" value={monthQuery.data?.total} tone="brand" isLoading={monthQuery.isPending} />
                <StatCard title="Esta semana" value={weekQuery.data?.total} isLoading={weekQuery.isPending} />
                <StatCard title="Pendientes de registrar" value={pending} isLoading={pending === undefined} />
            </div>

            <TableCard>
                <TableToolbar count={total === undefined ? undefined : `${total} ${total === 1 ? "consulta" : "consultas"}`}>
                    <SearchInput
                        label="Buscar consultas por paciente"
                        placeholder="Buscar por paciente…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    />
                    <DateFilter label="Desde" value={from} max={to || undefined} onChange={(value) => { setFrom(value); resetPage(); }} />
                    <DateFilter label="Hasta" value={to} min={from || undefined} onChange={(value) => { setTo(value); resetPage(); }} />
                </TableToolbar>

                <DataTable
                    caption="Listado de consultas"
                    columns={columns}
                    data={query.data?.items ?? []}
                    isLoading={query.isPending && !invalidRange}
                    isFetching={query.isFetching}
                    error={invalidRange ? "La fecha inicial no puede ser posterior a la fecha final." : query.isError ? query.error.message : null}
                    onRetry={() => query.refetch()}
                    mobileCard={(consultation) => <ConsultationCard consultation={consultation} onView={(c) => setDetailId(c.id)} />}
                    emptyIcon={FileSearch}
                    emptyTitle={hasFilters ? "No encontramos consultas" : "Aún no hay consultas"}
                    emptyDescription={
                        hasFilters
                            ? "Revisa el nombre del paciente o el rango de fechas."
                            : "Registra una consulta desde una cita completada."
                    }
                    pagination={{ page, limit, total: total ?? 0, onPageChange: setPage, noun: "consultas" }}
                />
            </TableCard>

            <ConsultationDetailModal consultationId={detailId} onClose={() => setDetailId(null)} />
            <CreateConsultationModal
                open={createDialog.open}
                onOpenChange={createDialog.setOpen}
            />
        </>
    );
}
