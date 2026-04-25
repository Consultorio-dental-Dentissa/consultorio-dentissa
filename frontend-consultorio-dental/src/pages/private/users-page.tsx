import { useEffect, useState } from "react";
import { useUsers } from "../../hooks/use-users";

import { PageTitle } from "../../components/common/page-title.component";
import { CreateUserModal } from "@/components/users/create-user-modal.component";
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table.component";

import toast from "react-hot-toast";

import type { User } from "@/types/models/user";
import type { CreateUserDto } from "@/types/api/request/create-user.dto";
import { getColumns } from "@/components/users/data-table-colums.component";

export default function UsersPage() {

    const [users, setUsers] = useState<User[]>([])
    const [openModal, setOpenModal] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);

    const { getUsers, updateUserStatus, registerUser } = useUsers();

    useEffect(() => {

        async function fetchUsers() {
            try {
                setLoadingTable(true);
                const users = await getUsers();
                setUsers(users);
                
            } catch (error) {
                toast.error((error as string))

            }
            finally {
                setLoadingTable(false);
            }
        }

        fetchUsers();
    }, []);


    const handleAddUser = async (userData: CreateUserDto) => {
        try {
            const user = await registerUser(userData);
            setUsers(prev => [...prev, user]);
            setOpenModal(false);
            toast.success(`El usuario ${user.name} ha sido registrado correctamente.`);

        } catch (error) {
            toast.error((error as string));
        }
    }

    const handleUpdatedUserStatus = async (id: number, status: boolean) => {
        try {
            const statusRes = await updateUserStatus(id, status);
            if (statusRes) {
                setUsers(prev => prev.map(user => user.id === id ? { ...user, status: status } : user));
                toast.success('El estado se actualizó correctamente');
            }

        } catch (error) {
            toast.error((error as string))
        }
    }

    const columns = getColumns(handleUpdatedUserStatus);

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

            <div className="bg-white mt-5">
                {
                    loadingTable ? 
                        <div className="bg-white rounded-sm p-5 flex justify-center">
                            <h2>Cargando...</h2>
                        </div>
                        :
                    users.length > 0 ?
                        <DataTable
                            columns={columns}
                            data={users}
                        />
                        :
                    !loadingTable && !users.length ?
                        <div className="bg-white rounded-sm p-5 flex justify-center">
                            <h2>No se encontrarón usuarios.</h2>
                        </div>
                        :
                        ''
                }

            </div>

            <CreateUserModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSubmit={handleAddUser}
            />

        </div>
    );

}