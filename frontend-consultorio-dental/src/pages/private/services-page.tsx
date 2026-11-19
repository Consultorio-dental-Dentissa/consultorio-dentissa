import { useMemo, useState } from "react";
import { Pencil, Stethoscope, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/page-header.component";
import { StatCard } from "@/components/shared/stat-card.component";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table.component";
import { SearchInput } from "@/components/shared/input.component";
import { FilterSelect } from "@/components/shared/select.component";
import { TableCard, TableToolbar } from "@/components/shared/table-card.component";
import { ACTIVE_STATUS_OPTIONS } from "@/config/filters";
import { Modal } from "@/components/shared/modal.component";
import { Drawer } from "@/components/shared/drawer.component";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useServices, useUpdateServiceStatus } from "@/features/services/hooks/use-services";
import { getServicesColumns } from "@/features/services/components/services-columns.component";
import { ServiceCard } from "@/features/services/components/service-card.component";
import { CreateServiceForm } from "@/features/services/components/create-service-form.component";
import { EditServiceForm } from "@/features/services/components/edit-service-form.component";
import { ServiceImagesManager } from "@/features/services/components/service-images-manager.component";
import { Role } from "@/features/users/types/rol.enum";
import { ApiError } from "@/services/api";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useDisclosure } from "@/hooks/use-disclosure";
import { usePagination } from "@/hooks/use-pagination";
import type { Service } from "@/features/services/types/service.model";

export default function ServicesPage() {
    const { user } = useAuth();
    const canManage = user?.role === Role.ADMINISTRADOR;

    const { search, setSearch, debouncedSearch } = useDebouncedSearch();
    const [status, setStatus] = useState("TODOS");
    const { page, limit, setPage, resetPage } = usePagination();

    const createDialog = useDisclosure();
    const [pendingDeactivate, setPendingDeactivate] = useState<Service | null>(null);
    const [managingId, setManagingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Solo el ADMIN puede filtrar por estado (el backend fuerza "activos" para el resto)
    const servicesQuery = useServices({
        page,
        limit,
        search: debouncedSearch,
        status: canManage ? status : undefined,
    });
    const totalQuery = useServices({ limit: 1, status: canManage ? "TODOS" : undefined });
    const activeQuery = useServices({ limit: 1, status: canManage ? "ACTIVO" : undefined });
    const inactiveQuery = useServices({ limit: 1, status: "INACTIVO" }, canManage);
    const statusMutation = useUpdateServiceStatus();

    const items = servicesQuery.data?.items ?? [];
    const managing = items.find((service) => service.id === managingId) ?? null;
    const editing = items.find((service) => service.id === editingId) ?? null;

    const activate = (service: Service) => {
        statusMutation.mutate(
            { id: service.id, status: true },
            {
                onSuccess: () => toast.success("Servicio activado"),
                onError: (error) => {
                    toast.error(error.message, { duration: 6000 });
                    // 409: sin imágenes → llevamos al administrador a subirlas
                    if (error instanceof ApiError && error.code === "conflict") setManagingId(service.id);
                },
            },
        );
    };

    const columns = useMemo(
        () =>
            getServicesColumns({
                canManage,
                onToggleStatus: (service) => {
                    if (service.status) setPendingDeactivate(service);
                    else activate(service);
                },
                onManageImages: (service) => setManagingId(service.id),
                onEdit: (service) => setEditingId(service.id),
            }),
        // `activate` solo depende de la mutación estable de TanStack Query.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [canManage],
    );

    const confirmDeactivate = () => {
        if (!pendingDeactivate) return;

        statusMutation.mutate(
            { id: pendingDeactivate.id, status: false },
            {
                onSuccess: () => {
                    toast.success("Servicio desactivado");
                    setPendingDeactivate(null);
                },
                onError: (error) => {
                    toast.error(error.message);
                    setPendingDeactivate(null);
                },
            },
        );
    };

    const hasFilters = (canManage && status !== "TODOS") || debouncedSearch !== "";
    const total = servicesQuery.data?.total;

    return (
        <>
            <PageHeader
                title="Servicios"
                description={
                    canManage
                        ? "Catálogo de tratamientos publicados en el sitio. Los nuevos inician inactivos hasta tener una imagen."
                        : "Catálogo de tratamientos activos del consultorio"
                }
                actions={canManage ? <Button onClick={createDialog.show}>+ Nuevo servicio</Button> : undefined}
            />

            {canManage && (
                <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
                    <StatCard title="Total de servicios" value={totalQuery.data?.total} isLoading={totalQuery.isPending} />
                    <StatCard title="Activos" value={activeQuery.data?.total} tone="brand" isLoading={activeQuery.isPending} />
                    <StatCard title="Inactivos" value={inactiveQuery.data?.total} isLoading={inactiveQuery.isPending} />
                </div>
            )}

            <TableCard>
                <TableToolbar count={total === undefined ? undefined : `${total} ${total === 1 ? "servicio" : "servicios"}`}>
                    <SearchInput
                        label="Buscar servicios"
                        placeholder="Buscar servicio…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    />
                    {canManage && (
                        <FilterSelect
                            label="Estatus" value={status} options={ACTIVE_STATUS_OPTIONS}
                            onChange={(value) => { setStatus(value); resetPage(); }}
                        />
                    )}
                </TableToolbar>

                <DataTable
                    caption="Catálogo de servicios"
                    columns={columns}
                    data={items}
                    isLoading={servicesQuery.isPending}
                    isFetching={servicesQuery.isFetching}
                    error={servicesQuery.isError ? servicesQuery.error.message : null}
                    onRetry={() => servicesQuery.refetch()}
                    mobileCard={(service) => (
                        <ServiceCard
                            service={service}
                            canManage={canManage}
                            onToggleStatus={(s) => (s.status ? setPendingDeactivate(s) : activate(s))}
                            onManageImages={(s) => setManagingId(s.id)}
                            onEdit={(s) => setEditingId(s.id)}
                        />
                    )}
                    emptyIcon={Stethoscope}
                    emptyTitle={hasFilters ? "No hay servicios con esos filtros" : "Aún no hay servicios"}
                    emptyDescription={
                        hasFilters
                            ? "Prueba con otro texto o cambia el estatus."
                            : canManage
                                ? "Registra el primer servicio del consultorio."
                                : "Pronto publicaremos los servicios disponibles."
                    }
                    pagination={{ page, limit, total: total ?? 0, onPageChange: setPage, noun: "servicios" }}
                />
            </TableCard>

            {canManage && (
                <>
                    <Modal
                        open={createDialog.open}
                        onClose={createDialog.setOpen}
                        icon={Wrench}
                        size="md"
                        title="Nuevo servicio"
                        description="Agrega un tratamiento al catálogo público"
                    >
                        <CreateServiceForm onSuccess={createDialog.hide} onCancel={createDialog.hide} />
                    </Modal>

                    <Modal
                        open={editing !== null}
                        onClose={(open) => !open && setEditingId(null)}
                        icon={Pencil}
                        size="md"
                        title="Editar servicio"
                        description={editing?.name}
                    >
                        {editing && (
                            <EditServiceForm key={editing.id} service={editing} onSuccess={() => setEditingId(null)} onCancel={() => setEditingId(null)} />
                        )}
                    </Modal>

                    <Drawer
                        open={managingId !== null}
                        onClose={(open) => !open && setManagingId(null)}
                        icon={Wrench}
                        title={managing ? `Imágenes de ${managing.name}` : "Imágenes del servicio"}
                        description="Sube, reemplaza o elimina las imágenes. Máximo 5 por servicio."
                    >
                        {managing && <ServiceImagesManager service={managing} />}
                    </Drawer>

                    <ConfirmDialog
                        open={pendingDeactivate !== null}
                        onOpenChange={(open) => !open && setPendingDeactivate(null)}
                        destructive
                        title="¿Desactivar servicio?"
                        description={
                            <>
                                <b>{pendingDeactivate?.name}</b> dejará de mostrarse en la web pública y no podrá agendarse hasta que lo actives de nuevo.
                            </>
                        }
                        confirmLabel="Desactivar"
                        loading={statusMutation.isPending}
                        onConfirm={confirmDeactivate}
                    />
                </>
            )}
        </>
    );
}
