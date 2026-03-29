import { useEffect, useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";
import { useUsuarios } from "../../hooks/useUsuarios";
import TablaVacia from "../../components/TablaVacia";
import { ToggleButton } from "../../components/ToggleButton";
import toast from "react-hot-toast";
import { type RespuestaUsuario } from "../../types/api/responses/RespuestaUsuario";
import { ModalUsuario } from "@/components/modals/ModalCrearUsuario";
import { Button } from "@/components/ui/button"
import type { CrearUsuario } from "@/types/api/request/CrearUsuario";

export default function Usuarios() {

    const [usuarios, setUsuarios] = useState<RespuestaUsuario[]>([])
    const [modalAbierto, setModalAbierto] = useState(false);

    const { obtenerUsuarios, cambiarEstadoUsuario, registrarUsuario, loading, error } = useUsuarios();

    useEffect(() => {

        async function cargarUsuarios() {
            const usuarios = await obtenerUsuarios();
            usuarios && setUsuarios(usuarios);
        }

        cargarUsuarios();
    }, []);


    const manejarUsuarioCreado = async (usuario: CrearUsuario) => {
        const nuevoUsuario = await registrarUsuario(usuario);
        if (nuevoUsuario) {
            toast.success('Se ha creado un nuevo usuario');
            setUsuarios(prev => [...prev, nuevoUsuario]);
            setModalAbierto(false);
        }
    }

    const manejarCambioDeEstado = async (id: number, nuevoEstado: boolean) => {

        const respuesta = await cambiarEstadoUsuario(id, nuevoEstado);
        if (respuesta) {
            setUsuarios(prev => {
                return prev.map(u => u.id === id ? { ...u, activo: nuevoEstado } : u)
            });

            toast.success('El estado se actualizó correctamente');
        }
    }


    return (
        <div>

            {error && toast.error(error)}

            <TituloPanel
                titulo="Panel de usuarios"
                subtitulo="Aqui puedes manejar tus usuarios"
            />

            <div className="contenedor-btn-registrar">
                <Button onClick={() => { setModalAbierto(true) }}>Registrar nuevo usuario</Button>
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
                        loading ? (
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

            <ModalUsuario
                open={modalAbierto}
                onOpenChange={(open) => setModalAbierto(open)}
                onSubmit={manejarUsuarioCreado}
            />

        </div>
    );

}