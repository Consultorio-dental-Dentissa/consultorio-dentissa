import { useEffect, useState } from "react";
import { TituloPanel } from "../../components/common/TituloPanel";
import { useUsuarios } from "../../hooks/useUsuarios";
import TablaVacia from "../../components/common/TablaVacia";
import { ToggleButton } from "../../components/common/ToggleButton";
import toast from "react-hot-toast";
import { type RespuestaUsuario } from "../../types/api/responses/RespuestaUsuario";
import { ModalCrearUsuario } from "@/components/modals/ModalCrearUsuario";
import { Button } from "@/components/ui/button"
import type { CrearUsuario } from "@/types/api/request/CrearUsuario";
import { PrimaryButton } from "@/components/common/Button";

export default function Usuarios() {

    const [usuarios, setUsuarios] = useState<RespuestaUsuario[]>([])
    const [modalAbierto, setModalAbierto] = useState(false);

    const { obtenerUsuarios, cambiarEstadoUsuario, registrarUsuario, loading, loadingTable } = useUsuarios();

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


    const manejarUsuarioCreado = async (usuario: CrearUsuario) => {
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
                return prev.map(u => u.id === id ? { ...u, activo: nuevoEstado } : u)
            });

            toast.success('El estado se actualizó correctamente');
        } catch (error) {
            toast.error((error as string))
        }
    }

    return (
        <div>

            <div className="mt-2 w-full flex justify-between items-end">
                <TituloPanel
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
                            <TablaVacia
                                mensaje="Cargando..."
                                submensaje="Buscando usuarios"
                                colSpan={7}
                            />
                        ) : usuarios.length === 0 ? (
                            <TablaVacia
                                mensaje="No se encontraron usuarios"
                                submensaje="Intenta agregar un nuevo usuario"
                                colSpan={7}
                            />
                        ) : (
                            usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td style={{ fontWeight: '600' }}>{usuario.nombre}</td>
                                    <td style={{ fontWeight: '500' }}>{usuario.apellido}</td>
                                    <td>{usuario.telefono}</td>
                                    <td>{usuario.correo}</td>

                                    <td>
                                        <ToggleButton
                                            estado={usuario.activo}
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

            <ModalCrearUsuario
                open={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onSubmit={manejarUsuarioCreado}
            />

        </div>
    );

}