import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/shared/input.component";
import { PageTitle } from "@/components/shared/page-title.component";
import { UsersTable } from "@/features/users/components/users-table.component";
import { CreateUserForm } from "@/features/users/components/create-user-form.component";
import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { Modal } from "@/components/shared/modal.component";
import { Users, User, Shield } from "lucide-react";
import { useCreateUser, useUsers } from "@/features/users/hooks/use-users";

import type { CreateUserDto } from "@/features/users/types/create-user.dto";
import toast from "react-hot-toast";

export default function UsersPage() {

    const [openModal, setOpenModal] = useState(false);
    
    const users = useUsers();
    const createUser = useCreateUser();

    const handleAddUser = async (userData: CreateUserDto) => {
        createUser.mutate(userData, {
            onSuccess: () => {
                toast.success('El usuario se registró correctamente');
                setOpenModal(false);
            },
            onError: (error) => toast.error(error.message)
        });
    }

    const totalUsers = useMemo(() => users.data ? users.data?.length : 0, [users.data]);
    const totalAdmins = useMemo(() => users.data ? users.data?.filter(u => u.role === 'ADMINISTRADOR').length : 0, [users.data]);
    const totalAssistans = useMemo(() => users.data ? users.data?.filter(u => u.role === 'ASISTENTE').length : 0, [users.data]);
    const totalPatients = useMemo(() => users.data ? users.data?.filter(u => u.role === 'PACIENTE').length : 0, [users.data]);

    return (
        <div>
            <div className="mt-2 w-full flex justify-between items-end">
                <PageTitle
                    titulo="Panel de usuarios"
                    subtitulo="Administra las cuentas de administradores, asistentes y pacientes"
                />

                <Button
                    variant="primary"
                    onClick={() => setOpenModal(true)}
                >
                    Agregar nuevo usuario
                </Button>
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
                    <div className="w-[30%]">
                        <SearchInput placeholder="Buscar por nombre, correo o telefono" />
                    </div>

                    <p className="text-neutral-400 text-sm font-semibold">
                        {totalUsers} {totalUsers === 1 ? 'usuario' : 'usuarios'}
                    </p>
                </div>

                <div className="flex justify-center pb-2">
                    <UsersTable />
                </div>
            </div>

            <Modal
                title='Registrar nuevo usuario'
                description='Porfavor llena todos los campos'
                open={openModal}
                onClose={() => setOpenModal(false)}>
                <CreateUserForm
                    onSubmit={handleAddUser}
                    onCancel={() => setOpenModal(false)}
                    isSaving={createUser.isPending}
                />
            </Modal>
        </div>
    );
}