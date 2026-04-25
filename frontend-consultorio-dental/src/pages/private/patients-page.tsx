import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPhone } from "@/utils/formatters";

import { usePatients } from "../../hooks/use-patients";

import { PageTitle } from "../../components/common/page-title.component";
import EmptyTable from "../../components/common/empty-table.component";
import { Button } from "@/components/ui/button";

import type { PatientResponse } from "../../types/api/responses/patient.response";

export default function PatientsPage() {

    const [patients, setPatients] = useState<PatientResponse[]>([])
    const { getPatients, loading } = usePatients();
    const navigate = useNavigate();

    useEffect(() => {

        async function fetchPatients() {
            const patients = await getPatients();
            patients && setPatients(patients);
        }

        fetchPatients();

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
                        ) : patients.length === 0 ? (
                            <EmptyTable mensaje="No hay pacientes"
                                submensaje="No se han encontrado pacientes"
                                colSpan={8}
                            />
                        ) :
                            patients.map((paciente) => {

                                const birthDate = new Date(paciente.birth_date);

                                return (
                                    <tr key={paciente.id}>
                                        <td>{paciente.user.name}</td>
                                        <td>{paciente.user.lastname}</td>
                                        <td>{paciente.user.email}</td>
                                        <td>{formatPhone(paciente.user.phone)}</td>
                                        <td>{formatPhone(paciente.emergency_phone)}</td>
                                        <td>{birthDate.toLocaleDateString('es-MX')}</td>
                                        <td>{paciente.address}</td>
                                        <td>
                                            <div className="actions">
                                            
                                                <Button variant="secondary" onClick={() => navigate(`/pacientes/${paciente.id}`)}>Ver perfil</Button>
                                                
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