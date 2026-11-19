import { useMemo, useState } from "react";
import { ScrollText, SearchX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header.component";
import { DataTable } from "@/components/shared/data-table.component";
import { FilterSelect } from "@/components/shared/select.component";
import { DateFilter } from "@/components/shared/date-filter.component";
import { TableCard, TableToolbar } from "@/components/shared/table-card.component";
import { AuditDetailModal } from "@/features/audit/components/audit-detail-modal.component";
import { getAuditColumns } from "@/features/audit/components/audit-columns.component";
import { useAuditLogs } from "@/features/audit/hooks/use-audit";
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS } from "@/features/audit/types/audit.labels";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import type { AuditLog } from "@/features/audit/types/audit.model";

const ACTION_OPTIONS = [
    { data: "Todas", value: "TODOS" },
    ...Object.entries(AUDIT_ACTION_LABELS).map(([value, data]) => ({ data, value })),
];
const ENTITY_OPTIONS = [
    { data: "Todas", value: "TODOS" },
    ...Object.entries(AUDIT_ENTITY_LABELS).map(([value, data]) => ({ data, value })),
];

/** Auditoría (solo ADMIN): bitácora de solo lectura con filtros en servidor. */
export default function AuditPage() {
    const [action, setAction] = useState("TODOS");
    const [entity, setEntity] = useState("TODOS");
    const [userText, setUserText] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const { page, limit, setPage, resetPage } = usePagination();
    const [selected, setSelected] = useState<AuditLog | null>(null);

    const debouncedUser = useDebounce(userText, 400);
    const userId = /^\d+$/.test(debouncedUser) ? Number(debouncedUser) : undefined;
    const invalidUser = userText.trim() !== "" && !/^\d+$/.test(userText.trim());
    const invalidRange = from !== "" && to !== "" && from > to;

    const query = useAuditLogs(
        { page, limit, action, entity, userId, from, to },
        !invalidRange && !invalidUser,
    );

    const columns = useMemo(() => getAuditColumns(setSelected), []);
    const hasFilters = action !== "TODOS" || entity !== "TODOS" || userId !== undefined || from !== "" || to !== "";
    const total = query.data?.total;

    const filterError = invalidRange
        ? "La fecha inicial no puede ser posterior a la fecha final."
        : invalidUser
            ? "El ID de usuario debe ser un número."
            : null;

    return (
        <>
            <PageHeader title="Auditoría" description="Bitácora de cambios del sistema (solo lectura)" />

            <TableCard>
                <TableToolbar count={total === undefined ? undefined : `${total} ${total === 1 ? "registro" : "registros"}`}>
                    <FilterSelect label="Acción" value={action} options={ACTION_OPTIONS} onChange={(value) => { setAction(value); resetPage(); }} />
                    <FilterSelect label="Entidad" value={entity} options={ENTITY_OPTIONS} onChange={(value) => { setEntity(value); resetPage(); }} />
                    <label className="flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-surface px-3 focus-within:ring-3 focus-within:ring-ring/50 sm:w-auto">
                        <span className="text-[13.5px] font-semibold text-ink-4">Usuario (ID):</span>
                        <input
                            type="text" inputMode="numeric" value={userText} placeholder="Todos"
                            onChange={(event) => { setUserText(event.target.value); resetPage(); }}
                            aria-invalid={invalidUser || undefined}
                            className="w-[80px] bg-transparent text-[15px] text-ink-2 outline-none placeholder:text-ink-5"
                        />
                    </label>
                    <DateFilter label="Desde" value={from} max={to || undefined} onChange={(value) => { setFrom(value); resetPage(); }} />
                    <DateFilter label="Hasta" value={to} min={from || undefined} onChange={(value) => { setTo(value); resetPage(); }} />
                </TableToolbar>

                <DataTable
                    caption="Registros de auditoría"
                    columns={columns}
                    data={query.data?.items ?? []}
                    isLoading={query.isPending && !filterError}
                    isFetching={query.isFetching}
                    error={filterError ?? (query.isError ? query.error.message : null)}
                    onRetry={filterError ? undefined : () => query.refetch()}
                    emptyIcon={hasFilters ? SearchX : ScrollText}
                    emptyTitle={hasFilters ? "No encontramos registros" : "Aún no hay registros"}
                    emptyDescription={hasFilters ? "Prueba con otros filtros o un rango de fechas distinto." : "Los cambios del sistema aparecerán aquí."}
                    pagination={{ page, limit, total: total ?? 0, onPageChange: setPage, noun: "registros" }}
                />
            </TableCard>

            <AuditDetailModal log={selected} onClose={() => setSelected(null)} />
        </>
    );
}
