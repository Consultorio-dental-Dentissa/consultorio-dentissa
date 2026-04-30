import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPhone } from "@/utils/formatters";
import { usePatients } from "../../hooks/use-patients";
import { PageTitle } from "../../components/common/page-title.component";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function PatientsPage() {

    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const { patients, getPatients, error } = usePatients();
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoadingTable(true);
        getPatients()
        .finally(() => setIsLoadingTable(false));
    }, []);

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    return (
        <div>

            <PageTitle
                titulo="Panel de pacientes"
                subtitulo="Aqui puedes manejar tus pacientes"
            />

            <table className="w-full">
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
                        isLoadingTable ? 
                        (
                            <div className="w-full bg-white p-5 rounded-lg flex justify-center">
                                <h2>Cargando...</h2>
                            </div>
                        )

                        :
                        
                        !patients.length ? 
                        (
                            <div className="w-full bg-white p-5 rounded-lg flex justify-center">
                                <h2>No se encontraron pacientes.</h2>
                            </div>
                        ) 
                        
                        :
                        
                        patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td>{patient.name}</td>
                                        <td>{patient.lastname}</td>
                                        <td>{patient.email}</td>
                                        <td>{formatPhone(patient.phone)}</td>
                                        <td>{formatPhone(patient.emergency_phone)}</td>
                                        <td>{patient.birth_date.toLocaleDateString('es-MX')}</td>
                                        <td>{patient.address}</td>
                                        <td>
                                            <div className="actions">
                                                <Button 
                                                    variant="secondary" 
                                                    onClick={() => navigate(`/pacientes/${patient.id}`)}>
                                                        Ver perfil
                                                </Button>
                                                
                                            </div>
                                        </td>
                                    </tr>
                                ))
                    }
                </tbody>
            </table>
        </div>
    );

}