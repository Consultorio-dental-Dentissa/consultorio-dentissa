import { PageTitle } from "@/components/common/page-title.component"
import { Button } from "@/components/ui/button"
import { useAppointments } from "@/hooks/use-appointments";
import { useEffect, useState } from "react"
import { AppointmentList } from "@/components/appointments/appointment-list.component";
import { AppointmentMap } from "@/types/mappers/appointment.mapper";

import type { Appointment } from "@/types/models/appointment";

export default function AppointmentsPage() {

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const { obtenerCitas } = useAppointments();

    useEffect(() => {

        async function cargarCitas() {

            const appointments = await obtenerCitas();
            const appointmentsMap = appointments.map(appointment => AppointmentMap(appointment));
            setAppointments(appointmentsMap);
        }

        cargarCitas();
    }, []);

    return (
        <>
            <div className="flex flex-row justify-between">
                <PageTitle
                    titulo="Modulo de citas"
                    subtitulo="Aqui puedes manejar tus citas"
                />

                <div className="flex flex-row justify-end mb-5">
                    <Button className="mt-5 bg-rose-500">Exportar citas</Button>
                </div>
            </div>

            <div className="flex flex-row justify-between bg-white w-full px-5 py-3 rounded-xl shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)]">
                <div className="flex flex-row gap-5">
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2 focus:font-medium">Todos</button>
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2 focus:font-medium">Pendientes</button>
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2 focus:font-medium">Confirmadas</button>
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2 focus:font-medium">Canceladas</button>
                </div>

                <div className="flex flex-row gap-2">
                    <Button variant="outline">Filtros</Button>
                    <Button variant="outline" onClick={() => {}}>Agendar cita</Button>
                </div>
            </div>

            <div className="mt-5">
                <h3 className="text-xl font-medium">Citas de hoy</h3>
                <AppointmentList appointments={appointments} />
            </div>
        </>
    )
}