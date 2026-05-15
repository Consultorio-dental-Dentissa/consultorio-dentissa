import { useEffect, useState } from "react";
import { usePatients } from "../../hooks/use-patients";
import { PageTitle } from "../../components/common/page-title.component";
import { getPatientsColumns } from "@/components/patients/patients-columns.component";
import { DataTable } from "@/components/common/data-table.component";
import { PatientInfoModal } from "@/components/patients/patient-info-modal.component";
import type { Patient } from "@/types/models/patient";

export default function PatientsPage() {

    const { patients, useGetAllPatients, isLoadingPatients, error } = usePatients();
    const [openInfoModal, setOpenInfoModal] = useState(false);
    const [currentPatient, setCurrentPatient] = useState<Patient>();

    useEffect(() => {
        useGetAllPatients();

    }, []);

    const patientsTableColumns = getPatientsColumns(
        () => setOpenInfoModal(true),
        setCurrentPatient
    );

    return (
        <div>

            <PageTitle
                titulo="Panel de pacientes"
                subtitulo="Aqui puedes manejar tus pacientes"
            />

            <div className="mt-5">
                {
                    isLoadingPatients ? (
                        <div className="bg-white rounded-md p-5 flex justify-center">
                            Cargando...
                        </div>
                    )

                    :
                    
                    !patients.length ? (
                        <div className="bg-red-500 text-white font-medium rounded-md p-5 flex justify-center">
                            {error ? error : 'No hay servicios.'}
                        </div>
                    )
                    
                    :
                    
                    (
                        <>
                            <div className="bg-white rounded-md">
                                <DataTable
                                    columns={patientsTableColumns}
                                    data={patients}
                                />
                            </div>

                            { /* Solo se genera el modal si existe la tabla */ }

                            <PatientInfoModal 
                                openModal={openInfoModal}
                                onClose={() => setOpenInfoModal(false)}
                                patient={currentPatient} 
                            />

                        </>
                    )
                }
            </div>
        </div>
    );

}