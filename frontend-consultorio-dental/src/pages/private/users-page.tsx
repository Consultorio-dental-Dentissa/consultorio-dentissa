import { useEffect, useState, useMemo } from "react";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table.component";
import { PageTitle } from "@/components/common/page-title.component";
import { Modal } from "@/components/common/modal.component";
import { CreateUserForm } from "@/components/users/create-user-form.component";
import { getColumns } from "@/components/users/data-table-colums.component";
import { CardDashboard } from "@/components/dashboard/card-dashboard.component";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectFilter, type SelectData } from "@/components/common/select.component";


import type { CreateUserDto } from "@/types/api/request/create-user.dto";

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

    const handleUpdatedUserStatus = async (id: number, status: boolean) => {
        const isStatusUpdated = await useUpdateUserStatus(id, status);
        if (isStatusUpdated) {
            toast.success('El estado se actualizó correctamente');
        }
    }


    const columns = useMemo(
        () => getColumns(handleUpdatedUserStatus),
        []);


    const rolSelectOptions: SelectData[] = useMemo(() =>
        [
            {
                data: "Todos",
                value: "TODOS"
            },
            {
                data: "Administrador",
                value: "ADMINISTRADOR"
            },
            {
                data: "Asistente",
                value: "ASISTENTE"
            },
            {
                data: "Paciente",
                value: "PACIENTE"
            }
        ], []);

    const statusSelectOptions: SelectData[] = useMemo(() =>
        [
            {
                data: "Todos",
                value: "TODOS"
            },
            {
                data: "Activo",
                value: true
            },
            {
                data: "No activo",
                value: false
            }
        ], []);


    return (
        <div>

            <div className="mt-2 w-full flex justify-between items-end">
                <PageTitle
                    titulo="Panel de usuarios"
                    subtitulo="Aqui puedes manejar tus usuarios"
                />

                <Button variant="primary" onClick={() => setOpenModal(true)}>
                    Agregar nuevo usuario
                </Button>
            </div>

            {/* sección de resumen */}
            <div className="flex w-full gap-3 mt-5">
                <CardDashboard
                    title="Usuarios totales"
                    icon={User}
                    data={users.length.toString()}
                />

                <CardDashboard
                    title="Administradores"
                    icon={User}
                    data={users.filter(u => u.role === "ADMINISTRADOR").length.toString()}
                />

                <CardDashboard
                    title="Asistentes"
                    icon={User}
                    data={users.filter(u => u.role === "ASISTENTE").length.toString()}
                />

                <CardDashboard
                    title="Pacientes"
                    icon={User}
                    data={users.filter(u => u.role === "PACIENTE").length.toString()}
                />
            </div>


            <div className="bg-white rounded-xl mt-5 border">
                {
                    isLoadingTable ?
                        (
                            <div className="bg-white rounded-lg p-5 flex justify-center">
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
                                <div>
                                    <div className="p-5 flex justify-between">
                                        <div className="w-full flex gap-1">

                                            <Input
                                                className="w-[40%]"
                                                placeholder="Buscar por nombre, correo o telefono"
                                            />

                                            <SelectFilter
                                                title="Rol"
                                                placeholder="Escoger rol"
                                                data={rolSelectOptions}
                                            />

                                            <SelectFilter
                                                title="Estatus"
                                                placeholder="Escoger estatus"
                                                data={statusSelectOptions}
                                            />

                                        </div>

                                        {/* Imprimimos el numero de usuarios, con el abjetivo "usuario" en plural o singular dependiendo de su cantidad */}
                                        <div className="w-full flex justify-end text-gray-500 text-sm font-medium">
                                            {users.length === 1 ? `${users.length} usuario` : `${users.length} usuarios`}
                                        </div>

                                    </div>

                                    <DataTable
                                        columns={columns}
                                        data={users}
                                    />
                                </div>

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