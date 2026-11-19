import { useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/page-header.component";
import { SearchInput } from "@/components/shared/input.component";
import { FilterSelect } from "@/components/shared/select.component";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { EmptyState } from "@/components/shared/empty-state.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { Pagination } from "@/components/shared/pagination.component";
import { TableCard, TableToolbar } from "@/components/shared/table-card.component";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FaqFormModal } from "@/features/faq/components/faq-form-modal.component";
import { FaqItem } from "@/features/faq/components/faq-item.component";
import { useAdminFaqs, useDeleteFaq, useUpdateFaqStatus } from "@/features/faq/hooks/use-faq";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { usePagination } from "@/hooks/use-pagination";
import type { Faq } from "@/features/faq/types/faq.model";

const STATUS_OPTIONS = [
    { data: "Todas", value: "TODOS" },
    { data: "Publicadas", value: "ACTIVO" },
    { data: "Borradores", value: "INACTIVO" },
];

/** Preguntas frecuentes (solo ADMIN): CRUD y publicación en el sitio público. */
export default function FaqPage() {
    const { search, setSearch, debouncedSearch } = useDebouncedSearch();
    const [status, setStatus] = useState("TODOS");
    const { page, limit, setPage, resetPage } = usePagination();

    const [formTarget, setFormTarget] = useState<{ faq: Faq | null } | null>(null);
    const [toDelete, setToDelete] = useState<Faq | null>(null);

    const query = useAdminFaqs({ page, limit, search: debouncedSearch, status });

    const statusMutation = useUpdateFaqStatus();
    const deleteMutation = useDeleteFaq();

    const hasFilters = status !== "TODOS" || debouncedSearch !== "";
    const items = query.data?.items ?? [];

    const toggleStatus = (faq: Faq, value: boolean) =>
        statusMutation.mutate(
            { id: faq.id, status: value },
            {
                onSuccess: () => toast.success(value ? "Pregunta publicada" : "Pregunta guardada como borrador"),
                onError: (error) => toast.error(error.message),
            },
        );

    const confirmDelete = () => {
        if (!toDelete) return;
        deleteMutation.mutate(toDelete.id, {
            onSuccess: () => {
                toast.success("Pregunta eliminada");
                setToDelete(null);
            },
            onError: (error) => {
                toast.error(error.message);
                setToDelete(null);
            },
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Preguntas frecuentes"
                description="Se muestran en la sección de preguntas frecuentes del sitio web."
                actions={<Button onClick={() => setFormTarget({ faq: null })}>+ Registrar pregunta</Button>}
            />

            <TableCard>
                <TableToolbar count={query.data ? `${query.data.total} ${query.data.total === 1 ? "pregunta" : "preguntas"}` : undefined}>
                    <SearchInput
                        label="Buscar preguntas"
                        placeholder="Buscar pregunta…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    />
                    <FilterSelect
                        label="Estatus" value={status} options={STATUS_OPTIONS}
                        onChange={(value) => { setStatus(value); resetPage(); }}
                    />
                </TableToolbar>

                {query.isPending ? (
                    <div className="flex flex-col gap-3 p-6" aria-busy="true" role="status">
                        <span className="sr-only">Cargando preguntas...</span>
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : query.isError ? (
                    <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
                ) : items.length === 0 ? (
                    <EmptyState
                        icon={MessageCircleQuestion}
                        title={hasFilters ? "No encontramos preguntas" : "Aún no hay preguntas frecuentes"}
                        description={hasFilters ? "Revisa el texto de búsqueda o el estatus." : "Crea la primera para mostrarla en el sitio público."}
                        action={!hasFilters ? <Button onClick={() => setFormTarget({ faq: null })}>+ Registrar pregunta</Button> : undefined}
                    />
                ) : (
                    <>
                        <ul aria-label="Preguntas frecuentes" aria-busy={query.isFetching} className={query.isFetching ? "opacity-70 transition-opacity" : ""}>
                            {items.map((faq) => (
                                <FaqItem
                                    key={faq.id}
                                    faq={faq}
                                    onEdit={(value) => setFormTarget({ faq: value })}
                                    onDelete={setToDelete}
                                    onToggleStatus={toggleStatus}
                                    togglingStatus={statusMutation.isPending}
                                />
                            ))}
                        </ul>
                        <div className="border-t border-line-row">
                            <Pagination
                                page={page} limit={limit} total={query.data?.total ?? 0}
                                onPageChange={setPage} disabled={query.isFetching} noun="preguntas"
                            />
                        </div>
                    </>
                )}
            </TableCard>

            <FaqFormModal
                key={formTarget?.faq?.id ?? "new"}
                open={formTarget !== null}
                onClose={() => setFormTarget(null)}
                faq={formTarget?.faq}
            />

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => !open && setToDelete(null)}
                destructive
                title="¿Eliminar pregunta?"
                description="Esta acción no se puede deshacer. La pregunta dejará de mostrarse en el sitio público."
                confirmLabel="Sí, eliminar"
                loading={deleteMutation.isPending}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
