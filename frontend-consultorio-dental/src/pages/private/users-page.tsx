import { useEffect, useState } from "react";
import { PageTitle } from "../../components/common/page-title.component";
import { useUsers } from "../../hooks/use-users";
import EmptyTable from "../../components/common/empty-table.component";
import { ToggleButton } from "../../components/common/toggle-button.component";
import toast from "react-hot-toast";
import { type UserResponse } from "../../types/api/responses/user.response";
import { CreateUserModal } from "@/components/users/create-user-modal.component";
import { Button } from "@/components/ui/button"
import type { CreateUserDto } from "@/types/api/request/create-user.dto";
import { PrimaryButton } from "@/components/common/button.component";

export default function UsersPage() {

    const [usuarios, setUsuarios] = useState<UserResponse[]>([])
    const [modalAbierto, setModalAbierto] = useState(false);

    const { obtenerUsuarios, cambiarEstadoUsuario, registrarUsuario, loadingTable } = useUsers();

    useEffect(() => {

        async function cargarUsuarios() {
            try {
                const usuarios = await obtenerUsuarios();
                setUsuarios(usuarios);
            } catch (error) {
                toast.error((error as string))
            }
        }

        cargarUsuarios();
    }, []);


    const manejarUsuarioCreado = async (usuario: CreateUserDto) => {
        try {
            const nuevoUsuario = await registrarUsuario(usuario);
            setUsuarios(prev => [...prev, nuevoUsuario]);
            setModalAbierto(false);
            toast.success('Se ha creado un nuevo usuario');

        } catch (error) {
            toast.error((error as string));
        }


    }

    const manejarCambioDeEstado = async (id: number, nuevoEstado: boolean) => {

        try {
            await cambiarEstadoUsuario(id, nuevoEstado);
            setUsuarios(prev => {
                return prev.map(u => u.id === id ? { ...u, status: nuevoEstado } : u)
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

                <PrimaryButton
                    message="Registrar nuevo usuario"
                    onClick={() => { setModalAbierto(true) }}
                />
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
                        ) : usuarios.length === 0 ? (
                            <EmptyTable
                                mensaje="No se encontraron usuarios"
                                submensaje="Intenta agregar un nuevo usuario"
                                colSpan={7}
                            />
                        ) : (
                            usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td style={{ fontWeight: '600' }}>{usuario.name}</td>
                                    <td style={{ fontWeight: '500' }}>{usuario.lastname}</td>
                                    <td>{usuario.phone}</td>
                                    <td>{usuario.email}</td>

                                    <td>
                                        <ToggleButton
                                            estado={usuario.status}
                                            onChange={(nuevoEstado) => manejarCambioDeEstado(usuario.id, nuevoEstado)}
                                        />
                                    </td>

                                    <td>{usuario.rol.rol}</td>

                                    <td>
                                        <div className="actions">
                                            <Button >Editar</Button>
                                            <Button variant="outline">Eliminar</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>

            <CreateUserModal
                open={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onSubmit={manejarUsuarioCreado}
            />

        </div>
    );

}