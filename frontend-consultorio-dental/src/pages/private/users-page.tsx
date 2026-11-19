import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/page-header.component";
import { StatCard } from "@/components/shared/stat-card.component";
import { TableCard, TableToolbar } from "@/components/shared/table-card.component";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table.component";
import { SearchInput } from "@/components/shared/input.component";
import { FilterSelect } from "@/components/shared/select.component";
import { ACTIVE_STATUS_OPTIONS } from "@/config/filters";
import { Modal } from "@/components/shared/modal.component";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDisclosure } from "@/hooks/use-disclosure";
import { EditUserForm } from "@/features/users/components/edit-user-form.component";
import { CreateUserForm } from "@/features/users/components/create-user-form.component";
import { UserCard } from "@/features/users/components/user-card.component";
import { getUsersColumns } from "@/features/users/components/users-columns.component";
import { useUpdateUserStatus, useUsers } from "@/features/users/hooks/use-users";
import { Role } from "@/features/users/types/rol.enum";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { usePagination } from "@/hooks/use-pagination";
import type { User } from "@/features/users/types/user.model";

const ROLE_FILTER_OPTIONS = [
    { data: "Todos", value: "TODOS" },
    { data: "Administradores", value: Role.ADMINISTRADOR },
    { data: "Asistentes", value: Role.ASISTENTE },
    { data: "Pacientes", value: Role.PACIENTE },
];

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const { search, setSearch, debouncedSearch } = useDebouncedSearch();
    const [status, setStatus] = useState("TODOS");
    const [role, setRole] = useState("TODOS");
    const { page, limit, setPage, resetPage } = usePagination();
    const createDialog = useDisclosure();
    const [pendingToggle, setPendingToggle] = useState<User | null>(null);
    const [editing, setEditing] = useState<User | null>(null);

    const usersQuery = useUsers({ page, limit, search: debouncedSearch, status, role });
    const totalQuery = useUsers({ limit: 1 });
    const adminsQuery = useUsers({ limit: 1, role: Role.ADMINISTRADOR });
    const assistantsQuery = useUsers({ limit: 1, role: Role.ASISTENTE });
    const patientsQuery = useUsers({ limit: 1, role: Role.PACIENTE });
    const statusMutation = useUpdateUserStatus();

    const columns = useMemo(
        () => getUsersColumns({ currentUserId: currentUser?.id ?? -1, onToggleStatus: setPendingToggle, onEdit: setEditing }),
        [currentUser?.id],
    );

    const confirmToggle = () => {
        if (!pendingToggle) return;
        const target = pendingToggle;

        statusMutation.mutate(
            { id: target.id, status: !target.status },
            {
                onSuccess: () => {
                    toast.success(target.status ? "Usuario desactivado" : "Usuario activado");
                    setPendingToggle(null);
                },
                onError: (error) => {
                    toast.error(error.message);
                    setPendingToggle(null);
                },
            },
        );
    };

    return (
        <>
            <PageHeader
                title="Usuarios"
                actions={<Button onClick={createDialog.show}>+ Nuevo usuario</Button>}
            />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total de usuarios" value={totalQuery.data?.total} isLoading={totalQuery.isPending} />
                <StatCard title="Administradores" value={adminsQuery.data?.total} isLoading={adminsQuery.isPending} />
                <StatCard title="Asistentes" value={assistantsQuery.data?.total} isLoading={assistantsQuery.isPending} />
                <StatCard title="Pacientes" value={patientsQuery.data?.total} tone="brand" isLoading={patientsQuery.isPending} />
            </div>

            <TableCard>
                <TableToolbar count={usersQuery.data ? `${usersQuery.data.total} ${usersQuery.data.total === 1 ? "usuario" : "usuarios"}` : undefined}>
                    <SearchInput
                        label="Buscar usuarios"
                        placeholder="Buscar por nombre, correo o teléfono"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    />
                    <FilterSelect
                        label="Rol" value={role} options={ROLE_FILTER_OPTIONS}
                        onChange={(value) => { setRole(value); resetPage(); }}
                    />
                    <FilterSelect
                        label="Estatus" value={status} options={ACTIVE_STATUS_OPTIONS}
                        onChange={(value) => { setStatus(value); resetPage(); }}
                    />
                </TableToolbar>

                <DataTable
                    caption="Listado de usuarios"
                    columns={columns}
                    mobileCard={(user) => (
                        <UserCard user={user} isSelf={user.id === currentUser?.id} onToggleStatus={setPendingToggle} onEdit={setEditing} />
                    )}
                    data={usersQuery.data?.items ?? []}
                    isLoading={usersQuery.isPending}
                    isFetching={usersQuery.isFetching}
                    error={usersQuery.isError ? usersQuery.error.message : null}
                    onRetry={() => usersQuery.refetch()}
                    emptyIcon={Users}
                    emptyTitle="No hay usuarios para mostrar"
                    emptyDescription="Prueba con otros filtros o crea un nuevo usuario."
                    pagination={{
                        page,
                        limit,
                        total: usersQuery.data?.total ?? 0,
                        onPageChange: setPage,
                        noun: "usuarios",
                    }}
                />
            </TableCard>

            <Modal open={createDialog.open} onClose={createDialog.setOpen} title="Nuevo usuario">
                <CreateUserForm onSuccess={createDialog.hide} onCancel={createDialog.hide} />
            </Modal>

            <Modal
                open={editing !== null}
                onClose={(open) => !open && setEditing(null)}
                title="Editar usuario"
            >
                {editing && <EditUserForm key={editing.id} user={editing} onSuccess={() => setEditing(null)} onCancel={() => setEditing(null)} />}
            </Modal>

            <ConfirmDialog
                open={pendingToggle !== null}
                onOpenChange={(open) => !open && setPendingToggle(null)}
                destructive={pendingToggle?.status === true}
                title={pendingToggle?.status ? "¿Desactivar usuario?" : "¿Activar usuario?"}
                description={
                    pendingToggle?.status ? (
                        <><b>{pendingToggle?.name} {pendingToggle?.lastname}</b> ya no podrá iniciar sesión hasta que lo vuelvas a activar.</>
                    ) : (
                        <><b>{pendingToggle?.name} {pendingToggle?.lastname}</b> podrá iniciar sesión de nuevo.</>
                    )
                }
                confirmLabel={pendingToggle?.status ? "Desactivar" : "Activar"}
                loading={statusMutation.isPending}
                onConfirm={confirmToggle}
            />
        </>
    );
}
