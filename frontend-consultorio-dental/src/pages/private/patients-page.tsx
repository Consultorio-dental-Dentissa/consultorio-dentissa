import { useEffect } from "react";
import { usePatients } from "../../hooks/use-patients";
import { PageTitle } from "../../components/common/page-title.component";
import { getPatientsColumns } from "@/components/patients/patients-columns.component";
import { DataTable } from "@/components/common/data-table.component";

export default function PatientsPage() {

    const { patients, useGetAllPatients, isLoadingPatients, error } = usePatients();

    useEffect(() => {
        useGetAllPatients();

    }, []);

    const patientsTableColumns = getPatientsColumns();

    return (
        <div>

            <PageTitle
                titulo="Panel de pacientes"
                subtitulo="Aqui puedes manejar tus pacientes"
            />

            <div className="mt-3 flex flex-row gap-5">
                <div className="bg-white rounded-sm px-5 py-2 min-w-[15%] border borer-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Número de pacientes: </p>                    
                    <p className="font-bold text-2xl">{patients.length}</p>
                </div>
            </div>

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
                        <div className="bg-white rounded-md">
                            <DataTable
                                columns={patientsTableColumns}
                                data={patients}
                            />
                        </div>
                    )
                }
            </div>
        </div>
    );

}