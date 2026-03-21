import { useEffect, useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";
import { useUsuarios } from "../../hooks/useUsuarios";
import type { Usuario } from "../../types/Usuario";
import TablaVacia from "../../components/tablaVacia";
import NuevoUsuarioForm from "../../components/NuevoUsuarioFormModal";
import { ToggleButton } from "../../components/ToggleButton";
import toast from "react-hot-toast";
import type { ApiError } from "../../types/respuestas/ApiError";

export default function Usuarios() {

    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [modalAbierto, setModalAbierto] = useState(false);

    const { obtenerUsuarios, cambiarEstadoUsuario, loading } = useUsuarios();



    useEffect(() => {

        async function cargarUsuarios() {
            const usuarios = await obtenerUsuarios();
            setUsuarios(usuarios);
        }

        cargarUsuarios();
    }, []);


    const manejarUsuarioCreado = (nuevoUsuario: Usuario) => {
        setUsuarios(prev => [...prev, nuevoUsuario]);
        setModalAbierto(false);
    }

    const manejarCambioDeEstado = async (id: number, nuevoEstado: boolean) => {

        try {
            await cambiarEstadoUsuario(id, nuevoEstado);
            setUsuarios(prev => {
                return prev.map(u => u.id === id ? { ...u, activo: nuevoEstado } : u)
            });

            toast.success('El estado se actualzó correctamente');

        } catch(error) {
            toast.error((error as ApiError).message);
        }
    }

    return (
        <div>
            <TituloPanel
                titulo="Panel de usuarios"
                subtitulo="Aqui puedes manejar tus usuarios"
            />

            <div className="contenedor-btn-registrar">
                <button className="btn-registrar" onClick={() => { setModalAbierto(true) }}>Registrar nuevo usuario</button>
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
                                            <button className="action-btn editar">Editar</button>
                                            <button className="action-btn eliminar">Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>


            {
                modalAbierto && (
                    <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <NuevoUsuarioForm
                                onSubmit={manejarUsuarioCreado}
                                onCancel={() => setModalAbierto(false)}
                            />
                        </div>
                    </div>
                )
            }

        </div>
    );

}