import { useEffect, useState } from "react";
import { PageTitle } from "../../components/common/page-title.component";
import { usePatients } from "../../hooks/use-patients";
import type { PatientResponse } from "../../types/api/responses/patient.response";
import EmptyTable from "../../components/common/empty-table.component";
import { useNavigate } from "react-router-dom";

export default function PatientsPage() {

    const [pacientes, setPacientes] = useState<PatientResponse[]>([])
    const { obtenerPacientes, loading } = usePatients();
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

            <PageTitle
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
                            <EmptyTable mensaje="Cargando..."
                                submensaje="Estamos buscando los pacientes"
                                colSpan={8}
                            />
                        ) : pacientes.length === 0 ? (
                            <EmptyTable mensaje="No hay pacientes"
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