import { useMemo, useState } from "react";
import { TagsIcon } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/page-header.component";
import { StatCard } from "@/components/shared/stat-card.component";
import { DataTable } from "@/components/shared/data-table.component";
import { SearchInput } from "@/components/shared/input.component";
import { FilterSelect } from "@/components/shared/select.component";
import { DateFilter } from "@/components/shared/date-filter.component";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { TableCard, TableToolbar } from "@/components/shared/table-card.component";
import { Button } from "@/components/ui/button";
import { ACTIVE_STATUS_OPTIONS } from "@/config/filters";
import { OfferFormModal } from "@/features/offers/components/offer-form-modal.component";
import { getOffersColumns } from "@/features/offers/components/offers-columns.component";
import { useAdminOffers, useDeleteOffer, useUpdateOfferStatus } from "@/features/offers/hooks/use-offers";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { usePagination } from "@/hooks/use-pagination";
import { clinicTodayKey } from "@/utils/clinic-time";
import type { Offer } from "@/features/offers/types/offer.model";

/** Ofertas (solo ADMIN): CRUD, estado, servicios incluidos e imagen única. */
export default function OffersPage() {
    const { search, setSearch, debouncedSearch } = useDebouncedSearch();
    const [status, setStatus] = useState("TODOS");
    const [date, setDate] = useState("");
    const { page, limit, setPage, resetPage } = usePagination();

    const [form, setForm] = useState<{ offerId: number | null } | null>(null);
    const [toDelete, setToDelete] = useState<Offer | null>(null);
    const [toDeactivate, setToDeactivate] = useState<Offer | null>(null);

    const query = useAdminOffers({ page, limit, search: debouncedSearch, status, date });
    const totalQuery = useAdminOffers({ limit: 1 });
    const currentQuery = useAdminOffers({ limit: 1, status: "ACTIVO", date: clinicTodayKey() });
    const activeQuery = useAdminOffers({ limit: 1, status: "ACTIVO" });
    const inactiveQuery = useAdminOffers({ limit: 1, status: "INACTIVO" });

    const statusMutation = useUpdateOfferStatus();
    const deleteMutation = useDeleteOffer();

    const items = query.data?.items ?? [];
    const editing = form?.offerId != null ? items.find((offer) => offer.id === form.offerId) ?? null : null;

    const setOfferStatus = (offer: Offer, value: boolean) =>
        statusMutation.mutate(
            { id: offer.id, status: value },
            {
                onSuccess: () => toast.success(value ? "Oferta activada" : "Oferta desactivada"),
                onError: (error) => toast.error(error.message, { duration: 6000 }),
            },
        );

    const columns = useMemo(
        () =>
            getOffersColumns({
                onToggleStatus: (offer) => {
                    if (offer.status) setToDeactivate(offer);
                    else setOfferStatus(offer, true);
                },
                onEdit: (offer) => setForm({ offerId: offer.id }),
                onDelete: setToDelete,
            }),
        // `setOfferStatus` solo depende de la mutación estable de TanStack Query.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const confirmDelete = () => {
        if (!toDelete) return;
        deleteMutation.mutate(toDelete.id, {
            onSuccess: () => {
                toast.success("Oferta eliminada");
                setToDelete(null);
            },
            onError: (error) => {
                toast.error(error.message);
                setToDelete(null);
            },
        });
    };

    const hasFilters = status !== "TODOS" || debouncedSearch !== "" || date !== "";
    const total = query.data?.total;

    return (
        <>
            <PageHeader
                title="Ofertas"
                description="Promociones mostradas en el sitio público"
                actions={<Button onClick={() => setForm({ offerId: null })}>+ Nueva oferta</Button>}
            />

            <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
                <StatCard title="Total de ofertas" value={totalQuery.data?.total} isLoading={totalQuery.isPending} />
                <StatCard title="Vigentes" value={currentQuery.data?.total} tone="brand" isLoading={currentQuery.isPending} />
                <StatCard title="Publicadas" value={activeQuery.data?.total} isLoading={activeQuery.isPending} />
                <StatCard title="No publicadas" value={inactiveQuery.data?.total} isLoading={inactiveQuery.isPending} />
            </div>

            <TableCard>
                <TableToolbar count={total === undefined ? undefined : `${total} ${total === 1 ? "oferta" : "ofertas"}`}>
                    <SearchInput
                        label="Buscar ofertas por título"
                        placeholder="Buscar por título…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    />
                    <FilterSelect
                        label="Estatus" value={status} options={ACTIVE_STATUS_OPTIONS}
                        onChange={(value) => { setStatus(value); resetPage(); }}
                    />
                    <DateFilter label="Vigente el" value={date} onChange={(value) => { setDate(value); resetPage(); }} />
                </TableToolbar>

                <DataTable
                    caption="Listado de ofertas"
                    columns={columns}
                    data={items}
                    isLoading={query.isPending}
                    isFetching={query.isFetching}
                    error={query.isError ? query.error.message : null}
                    onRetry={() => query.refetch()}
                    emptyIcon={TagsIcon}
                    emptyTitle={hasFilters ? "No encontramos ofertas" : "Aún no hay ofertas"}
                    emptyDescription={hasFilters ? "Revisa el título, el estatus o la fecha de vigencia." : "Crea la primera oferta para mostrarla en el sitio público."}
                    emptyAction={!hasFilters ? <Button onClick={() => setForm({ offerId: null })}>+ Nueva oferta</Button> : undefined}
                    pagination={{ page, limit, total: total ?? 0, onPageChange: setPage, noun: "ofertas" }}
                />
            </TableCard>

            <OfferFormModal
                key={form?.offerId ?? "new"}
                open={form !== null}
                onClose={() => setForm(null)}
                offer={editing}
            />

            <ConfirmDialog
                open={toDeactivate !== null}
                onOpenChange={(open) => !open && setToDeactivate(null)}
                title="¿Desactivar la oferta?"
                description="La oferta dejará de mostrarse en el sitio público. Podrás activarla de nuevo cuando quieras."
                confirmLabel="Desactivar"
                loading={statusMutation.isPending}
                onConfirm={() => {
                    if (!toDeactivate) return;
                    setOfferStatus(toDeactivate, false);
                    setToDeactivate(null);
                }}
            />

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => !open && setToDelete(null)}
                destructive
                title="¿Eliminar oferta?"
                description="Esta acción no se puede deshacer. La oferta y su imagen se eliminarán de forma permanente."
                confirmLabel="Sí, eliminar"
                loading={deleteMutation.isPending}
                onConfirm={confirmDelete}
            />
        </>
    );
}
