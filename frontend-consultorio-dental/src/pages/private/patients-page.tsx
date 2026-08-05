import { useEffect } from "react";
import { usePatients } from "@/features/patients/hooks/use-patients";
import { PageTitle } from "../../components/common/page-title.component";
import { getPatientsColumns } from "@/features/patients/components/patients-columns.component";
import { DataTable } from "@/components/common/data-table.component";
import { CardDashboard } from "@/components/common/card-dashboard.component";
import { SearchInput } from "@/components/common/input.component";
import { User } from "lucide-react";

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
                <CardDashboard
                    title="Pacientes"
                    data={patients.length.toString()}
                    icon={User}
                />

                <CardDashboard
                    title="Activos"
                    data="0"
                    icon={User}
                />

                <CardDashboard
                    title="No activos"
                    data="0"
                    icon={User}
                />

                <CardDashboard
                    title="Con cita pendiente"
                    data="0"
                    icon={User}
                />
            </div>

            <div className="bg-white rounded-xl mt-5 border">
                <div className="p-5 flex items-center justify-between">
                    <div className="w-[30%]">
                        <SearchInput placeholder="Buscar por nombre, correo o telefono" />
                    </div>

                    <p className="text-neutral-400 text-sm font-semibold">
                        {patients.length === 1 ? `${patients.length} paciente` : `${patients.length} pacientes`}
                    </p>
                </div>
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