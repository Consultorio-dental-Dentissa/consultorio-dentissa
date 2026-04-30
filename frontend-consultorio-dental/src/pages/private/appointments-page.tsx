import { useEffect, useState, useMemo } from "react"
import { PageTitle } from "@/components/common/page-title.component"
import { Button } from "@/components/ui/button"
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentList } from "@/components/appointments/appointment-list.component";
import { formatFirstLetterUppercase } from "@/utils/formatters";
import toast from "react-hot-toast";

export default function AppointmentsPage() {

    const [isLoadingList, setIsAppointmentList] = useState<boolean>(false);
    const { appointments, getAppointments, error } = useAppointments();

    useEffect(() => {
        setIsAppointmentList(true);
        getAppointments().finally(() => setIsAppointmentList(false));
    }, []);

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    const appointmentStatus = useMemo(() => {
        return [
                ['all', 'TODOS'], 
                ['PENDIENTES', 'PENDIENTES'], 
                ['CONFIRMADAS', 'CONFIRMADAS'], 
                ['CANCELADAS', 'CANCELADAS']
            ];
    }, []);

    return (
        <>
            <div className="flex flex-row justify-between">
                <PageTitle
                    titulo="Modulo de citas"
                    subtitulo="Aqui puedes manejar tus citas"
                />

                <div className="flex flex-row justify-end mb-5">
                    <Button variant="primary">
                        Exportar citas
                    </Button>
                </div>
            </div>

            <div className="flex flex-row justify-between bg-white w-full px-5 py-3 mt-5 rounded-md shadow-card">
                <div className="flex flex-row gap-5">
                    {
                        appointmentStatus.map(([key, label]) => (
                            <Button variant='ghost'>
                                {formatFirstLetterUppercase(label)}
                            </Button>
                        ))
                    }
                </div>

                <div className="flex flex-row gap-2">
                    <Button variant="outline">Filtros</Button>
                    <Button variant="outline" onClick={() => { }}>Agendar cita</Button>
                </div>
            </div>

            <div className="mt-5">
                {
                    isLoadingList ?
                        (
                            <div className="w-full bg-white p-5 rounded-lg flex justify-center">
                                <h2>Cargando...</h2>
                            </div>
                        )
                    :
                    !appointments.length ?
                        (
                            <div className="w-full bg-white p-5 rounded-lg flex justify-center">
                                <h2>No se han encontrado citas</h2>
                            </div>
                        )
                    :
                        (
                            <div>
                                <h3 className="text-xl font-medium">Citas de hoy</h3>
                                <AppointmentList appointments={appointments} />
                            </div>
                        )
                }
            </div>
        </>
    )
}