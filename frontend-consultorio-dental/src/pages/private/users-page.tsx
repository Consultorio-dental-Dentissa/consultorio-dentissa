import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/shared/input.component";
import { DataTable } from "@/components/shared/data-table.component";
import { PageTitle } from "@/components/shared/page-title.component";
import { Modal } from "@/components/shared/modal.component";
import { CreateUserForm } from "@/features/users/components/create-user-form.component";
import { getUsersTableColumns } from "@/features/users/components/users-colums.component";
import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { Users, User, Shield } from "lucide-react";
import { useUsers } from "@/features/users/hooks/use-users";
import type { CreateUserDto } from "@/features/users/types/create-user.dto";

import toast from "react-hot-toast";

export default function UsersPage() {

    const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState(false);

    const {
        users,
        useGetAllUsers,
        useUpdateUserStatus,
        useCreateUser,
        isLoading,
        error
    } = useUsers();

    useEffect(() => {
        setIsLoadingTable(true);
        useGetAllUsers().finally(() => setIsLoadingTable(false));
    }, []);

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    const handleAddUser = async (userData: CreateUserDto) => {
        const user = await useCreateUser(userData);
        if (user) {
            toast.success(`El usuario ${user.name} ha sido registrado correctamente.`);
            setOpenModal(false);
        }

    }

    const handleUpdateUserStatus = async (id: number, status: boolean) => {
        const isStatusUpdated = await useUpdateUserStatus(id, status);
        if (isStatusUpdated) {
            toast.success('El estado se actualizó correctamente');
        }
    }

    const usersTableColumns = useMemo(
        () => getUsersTableColumns(handleUpdateUserStatus),
        []);


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
                    data="0"
                />

                <CardDashboard
                    title="Administradores"
                    icon={Shield}
                    data="0"
                />

                <CardDashboard
                    title="Asistentes"
                    icon={User}
                    data="0"
                />

                <CardDashboard
                    title="Pacientes"
                    icon={User}
                    data="0"
                />
            </div>

            <div className="bg-white rounded-xl mt-5 border">
                <div className="p-5 flex items-center justify-between">
                    <div className="w-[30%]">
                        <SearchInput placeholder="Buscar por nombre, correo o telefono" />
                    </div>

                    <p className="text-neutral-400 text-sm font-semibold">
                        {users.length === 1 ? `${users.length} usuario` : `${users.length} usuarios`}
                    </p>
                </div>
                {
                    isLoadingTable ?
                        (
                            <div className="bg-white rounded-sm p-5 flex justify-center">
                                <h2>Cargando...</h2>
                            </div>
                        )

                        :

                    !users.length ?
                        (
                            <div className="bg-white rounded-sm p-5 flex justify-center">
                                <h2>No se encontrarón usuarios.</h2>
                            </div>
                        )

                        :
                        
                        (
                            <DataTable
                                columns={usersTableColumns}
                                data={users}
                            />
                        )
                }
            </div>

            <Modal
                title='Registrar nuevo usuario'
                description='Porfavor llena todos los campos'
                open={openModal}
                onClose={() => setOpenModal(false)}>
                <CreateUserForm
                    onSubmit={handleAddUser}
                    onCancel={() => setOpenModal(false)}
                    isSaving={isLoading}
                />
            </Modal>
        </div>
    );

}