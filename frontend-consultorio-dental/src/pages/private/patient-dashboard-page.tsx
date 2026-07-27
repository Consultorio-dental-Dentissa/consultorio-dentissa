import { useEffect } from "react";
import toast from "react-hot-toast";
import { PageTitle } from "@/components/common/page-title.component";
import { CardDashboard } from "@/components/dashboard/card-dashboard.component";
import { AppointmentSmallTable } from "@/components/appointments/appointment-small-table.component";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuth } from "@/context/auth-context-provider";
import { Calendar } from "lucide-react";

export default function PatientDashboardPage() {

    const { user } = useAuth();
    const { appointments, useGetMyAppointments, isLoading, error } = useAppointments();

    useEffect(() => {
        useGetMyAppointments();
    }, []);

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    return (
        <div>
            <PageTitle
                titulo={`Hola, ${user?.name}`}
                subtitulo="Aquí puedes ver tus citas agendadas"
            />

            <div className="mt-3 flex flex-row gap-5">
                <CardDashboard
                    title="Mis citas"
                    icon={Calendar}
                    data={appointments.length.toString()}
                />
            </div>

            <div className="bg-white rounded-xl mt-5 border">
                {
                    isLoading ?
                        (
                            <div className="bg-white rounded-lg p-5 flex justify-center">
                                <h2>Cargando...</h2>
                            </div>
                        )
                        :
                        !appointments.length ?
                            (
                                <div className="bg-white rounded-sm p-5 flex justify-center">
                                    <h2>No tienes citas agendadas.</h2>
                                </div>
                            )
                            :
                            (
                                <div className="p-5">
                                    <AppointmentSmallTable
                                        appointments={appointments}
                                    />
                                </div>
                            )
                }
            </div>
        </div>
    );
}
