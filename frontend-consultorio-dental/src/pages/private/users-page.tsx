import { SearchInput } from "@/components/shared/input.component";
import { PageTitle } from "@/components/shared/page-title.component";
import { UsersTable } from "@/features/users/components/users-table.component";
import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { SelectRoleUser } from "@/features/users/components/select-role-user.component";
import { SelectActiveStatus } from "@/components/shared/select-active-status.component";
import { Users, User, Shield } from "lucide-react";
import { useUsers } from "@/features/users/hooks/use-users";
import { CreateUserModal } from "@/features/users/components/create-user-modal.component";
import { useState } from "react";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";

export default function UsersPage() {

    const [role, setRole] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const { search, setSearch, debouncedSearch } = useDebouncedSearch();

    const users = useUsers();

    const totalUsers = users.data ? users.data.length : 0;
    const totalAdmins = users.data ? users.data.filter(u => u.role === 'ADMINISTRADOR').length : 0;
    const totalAssistans = users.data ? users.data.filter(u => u.role === 'ASISTENTE').length : 0;
    const totalPatients = users.data ? users.data.filter(u => u.role === 'PACIENTE').length : 0;

    return (
        <div>
            <div className="mt-2 w-full flex justify-between items-end">
                <PageTitle
                    titulo="Panel de usuarios"
                    subtitulo="Administra las cuentas de administradores, asistentes y pacientes"
                />

                <CreateUserModal />
            </div>

            <div className="flex gap-5 mt-5">
                <CardDashboard
                    title="Usuarios"
                    icon={Users}
                    data={totalUsers.toString()}
                />

                <CardDashboard
                    title="Administradores"
                    icon={Shield}
                    data={totalAdmins.toString()}
                />

                <CardDashboard
                    title="Asistentes"
                    icon={User}
                    data={totalAssistans.toString()}
                />

                <CardDashboard
                    title="Pacientes"
                    icon={User}
                    data={totalPatients.toString()}
                />
            </div>

            <div className="bg-white rounded-xl mt-5 border">
                <div className="p-5 flex items-center justify-between">
                    <div className="flex flex-row gap-2">
                        <SelectRoleUser value={role} onChange={setRole} />
                        <SelectActiveStatus value={status} onChange={setStatus} />
                        <SearchInput
                            placeholder="Buscar por nombre, correo o telefono"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <p className="text-neutral-400 text-sm font-semibold">
                        {totalUsers} {totalUsers === 1 ? 'usuario' : 'usuarios'}
                    </p>
                </div>

                <div className="flex justify-center pb-2">
                    <UsersTable
                        filters={{
                            role: role ?? undefined,
                            status: status ?? undefined,
                            search: debouncedSearch
                        }}
                    />
                </div>
            </div>
        </div>
    );
}