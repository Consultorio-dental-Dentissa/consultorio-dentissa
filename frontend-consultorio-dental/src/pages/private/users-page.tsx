import { useEffect, useState } from "react";
import { useUsers } from "../../hooks/use-users";

import { PageTitle } from "../../components/common/page-title.component";
import EmptyTable from "../../components/common/empty-table.component";
import { CreateUserModal } from "@/components/users/create-user-modal.component";
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch";

import { formatFirstLetterUppercase, formatPhone } from "@/utils/formatters";
import toast from "react-hot-toast";

import type { UserResponse } from "../../types/api/responses/user.response";
import type { CreateUserDto } from "@/types/api/request/create-user.dto";

export default function UsersPage() {

    const [users, setUsers] = useState<UserResponse[]>([])
    const [openModal, setOpenModal] = useState(false);

    const { getUsers, updateUserStatus, registerUser, loadingTable } = useUsers();

    useEffect(() => {

        async function fetchUsers() {
            try {
                const users = await getUsers();
                setUsers(users);
            } catch (error) {
                toast.error((error as string))
            }
        }

        fetchUsers();
    }, []);


    const handleNewUser = async (user: CreateUserDto) => {
        try {
            const newUser = await registerUser(user);
            setUsers(prev => [...prev, newUser]);
            setOpenModal(false);
            toast.success('Se ha creado un nuevo usuario');

        } catch (error) {
            toast.error((error as string));
        }
    }

    const handleUpdatedUserStatus = async (id: number, newStatus: boolean) => {

        try {
            await updateUserStatus(id, newStatus);
            setUsers(prev => {
                return prev.map(u => u.id === id ? { ...u, status: newStatus } : u)
            });

            toast.success('El estado se actualizó correctamente');
        } catch (error) {
            toast.error((error as string))
        }
    }

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

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                        <th>Estado</th>
                        <th>Rol</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>

                    {
                        loadingTable ? (
                            <EmptyTable
                                mensaje="Cargando..."
                                submensaje="Buscando usuarios"
                                colSpan={7}
                            />
                        ) : users.length === 0 ? (
                            <EmptyTable
                                mensaje="No se encontraron usuarios"
                                submensaje="Intenta agregar un nuevo usuario"
                                colSpan={7}
                            />
                        ) : (
                            users.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td style={{ fontWeight: '600' }}>{usuario.name}</td>
                                    <td style={{ fontWeight: '500' }}>{usuario.lastname}</td>
                                    <td>{formatPhone(usuario.phone)}</td>
                                    <td>{usuario.email}</td>

                                    <td>
                                        <Switch checked={usuario.status} onClick={() => handleUpdatedUserStatus(usuario.id, !usuario.status)}/>
                                    </td>

                                    <td>{formatFirstLetterUppercase(usuario.role.role)}</td>

                                    <td>
                                        <div className="actions">
                                            <Button variant="secondary">Editar</Button>
                                            <Button variant="destructive">Eliminar</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>

            <CreateUserModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSubmit={handleNewUser}
            />

        </div>
    );

}