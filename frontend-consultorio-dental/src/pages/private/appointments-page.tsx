import { useEffect, useState } from "react"
import toast from "react-hot-toast";

import { PageTitle } from "@/components/common/page-title.component"
import { Button } from "@/components/ui/button"
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentList } from "@/components/appointments/appointment-list.component";

import type { Appointment } from "@/types/models/appointment";

export default function AppointmentsPage() {

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const { getAppointments } = useAppointments();

    useEffect(() => {

        async function fetchAppointments() {
            try {
                const appointments = await getAppointments();
                setAppointments(appointments);

            } catch(error) {
                toast.error(error as string);
            }
        }

        fetchAppointments();
    }, []);

    return (
        <>
            <div className="flex flex-row justify-between">
                <PageTitle
                    titulo="Modulo de citas"
                    subtitulo="Aqui puedes manejar tus citas"
                />

                <div className="flex flex-row justify-end mb-5">
                    <Button variant="primary">Exportar citas</Button>
                </div>
            </div>

            <div className="flex flex-row justify-between bg-white w-full px-5 py-3 mt-5 rounded-md shadow-card">
                <div className="flex flex-row gap-5">
                    <Button variant="ghost">Todos</Button>
                    <Button variant="ghost">Pendientes</Button>
                    <Button variant="ghost">Confirmadas</Button>
                    <Button variant="ghost">Canceladas</Button>
                </div>

                <div className="flex flex-row gap-2">
                    <Button variant="outline">Filtros</Button>
                    <Button variant="outline" onClick={() => { }}>Agendar cita</Button>
                </div>
            </div>

            <div className="mt-5">
                <h3 className="text-xl font-medium">Citas de hoy</h3>
                <AppointmentList appointments={appointments} />
            </div>
        </>
    )
}