import { useEffect, useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";
import { usePacientes } from "../../hooks/usePacientes";
import type { RespuestaPaciente } from "../../types/respuestas/RespuestaPaciente";
import TablaVacia from "../../components/tablaVacia";
import { get } from "../../services/api";

export default function Pacientes() {

    const [pacientes, setPacientes] = useState<RespuestaPaciente[]>([])
    const { obtenerPacientes, loading } = usePacientes();

    useEffect(() => {

        async function cargarPacientes() {
            const pacientes = await obtenerPacientes();
            setPacientes(pacientes);
        }

        cargarPacientes();

    }, []);


    return (
        <div>
            <TituloPanel
                titulo="Panel de pacientes"
                subtitulo="Aqui puedes manejar tus pacientes"
            />

            <table id="tablaPacientes">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Teléfono de emergencia</th>
                        <th>Fecha de nacimiento</th>
                        <th>Dirección</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>

                    {
                        loading ? (
                            <TablaVacia mensaje="Cargando..."
                                submensaje="Estamos buscando los pacientes"
                                colSpan={8}
                            />
                        ) : pacientes.length === 0 ? (
                            <TablaVacia mensaje="No hay pacientes"
                                submensaje="No se han encontrado pacientes"
                                colSpan={8}
                            />
                        ) :
                            pacientes.map((paciente) => {

                                const fecha_nacimiento = new Date(paciente.fecha_nacimiento);

                                return (
                                    <tr key={paciente.id}>
                                        <td>{paciente.usuario.nombre}</td>
                                        <td>{paciente.usuario.apellido}</td>
                                        <td>{paciente.usuario.correo}</td>
                                        <td>{paciente.usuario.telefono}</td>
                                        <td>{paciente.telefono_emergencia}</td>
                                        <td>{fecha_nacimiento.toLocaleDateString('es-MX')}</td>
                                        <td>{paciente.direccion}</td>
                                        <td>
                                            <div className="actions">
                                                {
                                                    /*
                                                    <button className="action-btn editar">Editar</button>
                                                    <button className="action-btn eliminar">Eliminar</button>
                                                    */
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                    }

                </tbody>
            </table>

        </div>
    );

}