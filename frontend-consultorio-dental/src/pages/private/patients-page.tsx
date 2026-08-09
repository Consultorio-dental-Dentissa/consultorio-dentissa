import { usePatients } from "@/features/patients/hooks/use-patients";
import { PageTitle } from "../../components/shared/page-title.component";
import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { PatientsTable } from "@/features/patients/components/patients-table.component";
import { SearchInput } from "@/components/shared/input.component";
import { User } from "lucide-react";

export default function PatientsPage() {

    const patients = usePatients();

    const totalPatients = patients.data ? patients.data.length : 0;
    const activePatients = patients.data ? patients.data.filter(p => p.status).length : 0;
    const inactivePatients = patients.data ? patients.data.filter(p => !p.status).length : 0;

    return (
        <>
            <PageTitle
                titulo="Panel de pacientes"
                subtitulo="Aqui puedes manejar tus pacientes"
            />

            <div className="mt-3 flex flex-row gap-5">
                <CardDashboard
                    title="Pacientes"
                    data={totalPatients.toString()}
                    icon={User}
                />

                <CardDashboard
                    title="Activos"
                    data={activePatients.toString()}
                    icon={User}
                />

                <CardDashboard
                    title="No activos"
                    data={inactivePatients.toString()}
                    icon={User}
                />

                {
                /**
                 * TODO:
                 * Remember add patientsWithScheduledAppointment property in 
                 * get patients responses in the future
                 */
                }
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
                        {totalPatients} {totalPatients != 1 ? 'pacientes' : 'paciente'}
                    </p>
                </div>
                <div className={`flex justify-center ${(patients.isLoading || !patients.data?.length) && 'p-5'}`}>
                    <PatientsTable />
                </div>
            </div>
        </>
    );
}