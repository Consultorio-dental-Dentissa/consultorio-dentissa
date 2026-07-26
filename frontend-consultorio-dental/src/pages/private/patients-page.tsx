import { useEffect, useMemo } from "react";
import { usePatients } from "../../hooks/use-patients";
import { PageTitle } from "../../components/common/page-title.component";
import { getPatientsColumns } from "@/components/patients/patients-columns.component";
import { DataTable } from "@/components/common/data-table.component";
import { CardDashboard } from "@/components/dashboard/card-dashboard.component";
import { User } from "lucide-react";

export default function PatientsPage() {

    const { patients, useGetAllPatients, isLoadingPatients, error } = usePatients();

    useEffect(() => {
        useGetAllPatients();

    }, []);

    const patientsTableColumns = getPatientsColumns();

    const patientsData = useMemo(() => {
        return {
            "totalPatients": patients.length.toString(),
            "totalActive": patients.filter(p => p.status === true).length.toString(),
            "totalNonActive": patients.filter(p => p.status === false).length.toLocaleString()
        };
    }, [patients]);

    return (
        <div>

            <PageTitle
                titulo="Panel de pacientes"
                subtitulo="Aqui puedes manejar tus pacientes"
            />

            <div className="mt-3 flex flex-row gap-5">
                <CardDashboard
                    title="Pacientes totales"
                    data={patientsData.totalPatients}
                    icon={User}
                />

                <CardDashboard
                    title="Pacientes activos"
                    data={patientsData.totalActive}
                    icon={User}
                />

                <CardDashboard
                    title="Pacientes no activos"
                    data={patientsData.totalNonActive}
                    icon={User}
                />
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