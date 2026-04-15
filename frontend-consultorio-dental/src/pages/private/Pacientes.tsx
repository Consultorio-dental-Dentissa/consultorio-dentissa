import { useEffect, useState } from "react";
import { TituloPanel } from "../../components/common/TituloPanel";
import { usePacientes } from "../../hooks/usePacientes";
import type { RespuestaPaciente } from "../../types/api/responses/RespuestaPaciente";
import TablaVacia from "../../components/common/TablaVacia";
import { useNavigate } from "react-router-dom";

export default function Pacientes() {

    const [pacientes, setPacientes] = useState<RespuestaPaciente[]>([])
    const { obtenerPacientes, loading } = usePacientes();
    const navigate = useNavigate();

    useEffect(() => {

        async function cargarPacientes() {
            const pacientes = await obtenerPacientes();
            pacientes && setPacientes(pacientes);
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

                                const birthDate = new Date(paciente.birth_date);

                                return (
                                    <tr key={paciente.id}>
                                        <td>{paciente.user.name}</td>
                                        <td>{paciente.user.lastname}</td>
                                        <td>{paciente.user.email}</td>
                                        <td>{paciente.user.phone}</td>
                                        <td>{paciente.emergency_phone}</td>
                                        <td>{birthDate.toLocaleDateString('es-MX')}</td>
                                        <td>{paciente.address}</td>
                                        <td>
                                            <div className="actions">
                                            
                                                <button className="btn-registrar" onClick={() => {navigate(`/pacientes/${paciente.id}`)}}>Ver perfil</button>
                                                
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