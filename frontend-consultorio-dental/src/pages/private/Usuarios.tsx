import { useEffect, useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";
import { useUsuarios } from "../../hooks/useUsuarios";
import type { Usuario } from "../../types/Usuario";

export default function Usuarios() {

    const [usuarios, setUsuarios] = useState<Usuario[]>([])

    const { obtenerUsuarios, loading } = useUsuarios();

    useEffect(() => {

        async function cargarUsuarios() {
            const usuarios = await obtenerUsuarios();
            setUsuarios(usuarios);
        }

        cargarUsuarios();
    }, []);

    return (
        <div>
            <TituloPanel
                titulo="Panel de usuarios"
                subtitulo="Aqui puedes manejar tus usuarios"
            />

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
                    {loading ? <p style={{color: 'red'}}>Cargando...</p> : ''}
                    {
                        usuarios.length >= 1 ? usuarios.map((usuario) => {
                            return (
                                <tr>
                                    <td> { usuario.nombre } </td>
                                    <td> { usuario.apellido } </td>
                                    <td> { usuario.telefono } </td>
                                    <td> { usuario.correo } </td>

                                    <td><span className="badge activo"> {usuario.activo ? "Activo" : "No activo" } </span></td>
                                    <td> { usuario.rol.rol } </td>
                                    <td><div className="actions">
                                        <button className="action-btn editar">Editar</button>
                                        <button className="action-btn eliminar">Eliminar</button>
                                    </div></td>
                                </tr>
                            )
                        })
                            : ''
                    }
                </tbody>
            </table>

            {/*
            <div className="contenedor-tabla">
                <div className="header-tabla">
                </div>

                <div className="registros-tabla">
                    {
                        usuarios.length >= 1 ? usuarios.map((usuario) => {
                            return <div className="registro">
                                {usuario.nombre}
                            </div>
                        }) :
                            <div className="registro">Vacio</div>
                    }

                </div>

            </div>
            */}
        </div>
    );

}