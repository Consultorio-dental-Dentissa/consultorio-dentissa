import { useEffect, useState, useMemo } from "react";
import { useUsers } from "@/hooks/use-users";

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table.component";
import { PageTitle } from "@/components/common/page-title.component";
import { CreateUserModal } from "@/components/users/create-user-modal.component";
import toast from "react-hot-toast";
import { Role } from "@/types/enums/rol.enum";
import { getColumns } from "@/components/users/data-table-colums.component";
import { formatFirstLetterUppercase } from "@/utils/formatters";

import type { User } from "@/types/models/user";
import type { CreateUserDto } from "@/types/api/request/create-user.dto";

export default function UsersPage() {

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [openModal, setOpenModal] = useState(false);

    const { getUsers, updateUserStatus, registerUser, loadingTable } = useUsers();

    useEffect(() => {

        async function fetchUsers() {
            try {
                const users = await getUsers();
                setAllUsers(users);
                setFilteredUsers(users);

            } catch (error) {
                toast.error((error as string))
            }
        }

        fetchUsers();
    }, []);

    function filterUsers(role: string) {

        setSelectedRole(role);

        if (role === 'all') {
            setFilteredUsers(allUsers);
        } else {
            setFilteredUsers(allUsers.filter(user => user.role === role));
        }
    }

    useEffect(() => {
        filterUsers(selectedRole);
    }, [allUsers]);


    const handleAddUser = async (userData: CreateUserDto) => {
        try {
            const user = await registerUser(userData);
            setAllUsers(prev => [...prev, user]);
            toast.success(`El usuario ${user.name} ha sido registrado correctamente.`);
            setOpenModal(false);

        } catch (error) {
            toast.error((error as string));
        }
    }

    const handleUpdatedUserStatus = async (id: number, status: boolean) => {
        try {
            const response = await updateUserStatus(id, status);
            if (response) {
                setAllUsers(prev => 
                    prev.map(user => user.id === id ? { ...user, status: status } : user)
                );
                toast.success('El estado se actualizó correctamente');
            }

        } catch (error) {
            toast.error((error as string))
        }
    }

    const columns = useMemo(() => getColumns(handleUpdatedUserStatus), []);

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
                <Button variant="ghost" onClick={() => filterUsers('all')}>
                    Todos
                </Button>
                {Object.values(Role).map(role => (
                    <Button variant="ghost" onClick={() => filterUsers(role)}>
                        {formatFirstLetterUppercase(role)}
                    </Button>
                ))}
            </div>

            <div className="bg-white rounded-md mt-5 shadow-card">
                {
                    loadingTable ?
                        <div className="bg-white rounded-sm p-5 flex justify-center">
                            <h2>Cargando...</h2>
                        </div>
                        :
                    !filteredUsers.length ?
                        <div className="bg-white rounded-sm p-5 flex justify-center">
                            <h2>No se encontrarón usuarios.</h2>
                        </div>
                        :
                        <DataTable
                            columns={columns}
                            data={filteredUsers}
                        />
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