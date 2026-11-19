import { useMemo, useState } from "react";
import { UserSearch } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header.component";
import { StatCard } from "@/components/shared/stat-card.component";
import { DataTable } from "@/components/shared/data-table.component";
import { SearchInput } from "@/components/shared/input.component";
import { FilterSelect } from "@/components/shared/select.component";
import { Modal } from "@/components/shared/modal.component";
import { TableCard, TableToolbar } from "@/components/shared/table-card.component";
import { Button } from "@/components/ui/button";
import { ACTIVE_STATUS_OPTIONS } from "@/config/filters";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { usePatients } from "@/features/patients/hooks/use-patients";
import { PatientCard } from "@/features/patients/components/patient-card.component";
import { getPatientsColumns } from "@/features/patients/components/patients-columns.component";
import { CreateUserForm } from "@/features/users/components/create-user-form.component";
import { Role } from "@/features/users/types/rol.enum";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useDisclosure } from "@/hooks/use-disclosure";
import { usePagination } from "@/hooks/use-pagination";

/** Pacientes.dc.html (ADMIN) y Asistente - Pacientes.dc.html (ASISTENTE: sin "Nuevo paciente"; ficha reducida). */
export default function PatientsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === Role.ADMINISTRADOR;

    const { search, setSearch, debouncedSearch } = useDebouncedSearch();
    const [status, setStatus] = useState("TODOS");
    const { page, limit, setPage, resetPage } = usePagination();
    const createDialog = useDisclosure();

    const patientsQuery = usePatients({ page, limit, search: debouncedSearch, status });
    // Totales reales del servidor (sin filtros de búsqueda) para las tarjetas.
    const totalQuery = usePatients({ limit: 1 });
    const activeQuery = usePatients({ limit: 1, status: "ACTIVO" });
    const inactiveQuery = usePatients({ limit: 1, status: "INACTIVO" });

    const columns = useMemo(() => getPatientsColumns(), []);
    const hasFilters = status !== "TODOS" || debouncedSearch !== "";
    const total = patientsQuery.data?.total;

    return (
        <>
            <PageHeader
                title="Pacientes"
                actions={isAdmin && <Button onClick={createDialog.show}>+ Nuevo paciente</Button>}
            />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total de pacientes" value={totalQuery.data?.total} isLoading={totalQuery.isPending} />
                <StatCard title="Activos" value={activeQuery.data?.total} tone="brand" isLoading={activeQuery.isPending} />
                <StatCard title="Inactivos" value={inactiveQuery.data?.total} isLoading={inactiveQuery.isPending} />
            </div>

            <TableCard>
                <TableToolbar count={total === undefined ? undefined : `${total} ${total === 1 ? "paciente" : "pacientes"}`}>
                    <SearchInput
                        label="Buscar pacientes"
                        placeholder="Buscar por nombre, correo o teléfono"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    />
                    <FilterSelect
                        label="Estatus" value={status} options={ACTIVE_STATUS_OPTIONS}
                        onChange={(value) => { setStatus(value); resetPage(); }}
                    />
                </TableToolbar>

                <DataTable
                    caption="Listado de pacientes"
                    columns={columns}
                    mobileCard={(patient) => <PatientCard patient={patient} />}
                    data={patientsQuery.data?.items ?? []}
                    isLoading={patientsQuery.isPending}
                    isFetching={patientsQuery.isFetching}
                    error={patientsQuery.isError ? patientsQuery.error.message : null}
                    onRetry={() => patientsQuery.refetch()}
                    emptyIcon={UserSearch}
                    emptyTitle={hasFilters ? "No encontramos pacientes" : "Aún no hay pacientes"}
                    emptyDescription={
                        hasFilters
                            ? "Revisa el texto de búsqueda o quita los filtros."
                            : "Los pacientes aparecerán aquí cuando se registren."
                    }
                    pagination={{ page, limit, total: total ?? 0, onPageChange: setPage, noun: "pacientes" }}
                />
            </TableCard>

            {isAdmin && (
                <Modal open={createDialog.open} onClose={createDialog.setOpen} title="Nuevo paciente">
                    <CreateUserForm
                        fixedRole={Role.PACIENTE}
                        submitLabel="Registrar paciente"
                        successMessage="Paciente registrado correctamente"
                        onSuccess={createDialog.hide}
                        onCancel={createDialog.hide}
                    />
                </Modal>
            )}
        </>
    );
}
