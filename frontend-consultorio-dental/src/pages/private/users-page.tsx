import { useEffect, useState, useMemo } from "react";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table.component";
import { PageTitle } from "@/components/common/page-title.component";
import { Modal } from "@/components/common/modal.component";
import { CreateUserForm } from "@/components/users/create-user-form.component";
import { getColumns } from "@/components/users/data-table-colums.component";

import type { CreateUserDto } from "@/types/api/request/create-user.dto";

import toast from "react-hot-toast";

export default function UsersPage() {

    const [selectedRole, setSelectedRole] = useState<string>('ALL');
    const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState(false);

    const { 
        users, 
        getUsers, 
        updateUserStatus, 
        registerUser, 
        error 
    } = useUsers();

    useEffect(() => {
        setIsLoadingTable(true);
        getUsers().finally(() => setIsLoadingTable(false));
    }, []);

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    const handleAddUser = async (userData: CreateUserDto) => {
        const user = await registerUser(userData);
        if (user) {
            toast.success(`El usuario ${user.name} ha sido registrado correctamente.`);
            setOpenModal(false);
        }

    }

    const handleUpdatedUserStatus = async (id: number, status: boolean) => {
        const isStatusUpdated = await updateUserStatus(id, status);
        if (isStatusUpdated) {
            toast.success('El estado se actualizó correctamente');
        }
    }

    const columns = useMemo(
        () => getColumns(handleUpdatedUserStatus), 
    []);

    const roles = useMemo(() => [
        { key: 'ALL', label: 'Todos' },
        { key: 'ADMINISTRADOR', label: 'Administrador' },
        { key: 'ASISTENTE', label: 'Asistente' },
        { key: 'PACIENTE', label: 'Paciente' }
    ], []);

    const filteredUsers = useMemo(() => {

        if (selectedRole === 'ALL') {
            return users;
        }

        return users.filter(user => user.role === selectedRole);
    }, [users, selectedRole]);

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

            <div className="bg-white rounded-sm p-3 mt-5 shadow-card">
                {
                    roles.map(role => (
                        <Button
                            variant={selectedRole === role.key ? 'selectedGhost' : 'ghost'}
                            onClick={() => setSelectedRole(role.key)}>
                                { role.label }
                        </Button>
                    ))
                }
            </div>

            <div className="bg-white rounded-md mt-5 shadow-card">
                {
                    isLoadingTable ?
                        (
                            <div className="bg-white rounded-sm p-5 flex justify-center">
                                <h2>Cargando...</h2>
                            </div>
                        )
                    :
                    !filteredUsers.length ?
                        (
                            <div className="bg-white rounded-sm p-5 flex justify-center">
                                <h2>No se encontrarón usuarios.</h2>
                            </div>
                        )
                    :
                        (
                            <DataTable
                                columns={columns}
                                data={filteredUsers}
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
                />
            </Modal>

        </div>
    );

}