import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { useAppointments } from "../hooks/use-appointments";
import { useMemo } from "react";
import { STATUS_APPOINTMENT } from "../types/status-appointment.enum";
import { Calendar, CalendarCheck, Clock } from "lucide-react";


export function AppointmentsTopCards() {

    const appointments = useAppointments();

    const cardDashboardData = useMemo(() => [
        {
            title: 'Total de citas',
            icon: Calendar,
            data: (appointments.data ? appointments.data.length : 0).toString()
        },
        {
            title: 'Pendientes',
            icon: Clock,
            data: (appointments.data ?
                appointments.data.filter(a => a.status === STATUS_APPOINTMENT.PENDIENTE).length : 0).toString()
        },
        {
            title: 'Confirmadas',
            icon: CalendarCheck,
            data: (appointments.data ?
                appointments.data.filter(a => a.status === STATUS_APPOINTMENT.CONFIRMADA).length : 0).toString()
        },
        {
            title: 'Reprogramadas',
            icon: Calendar,
            data: (appointments.data ?
                appointments.data.filter(a => a.status === STATUS_APPOINTMENT.REPROGRAMADA).length : 0).toString()
        }
    ], [appointments.data]);

    return (
        cardDashboardData.map(data => (
            <CardDashboard
                title={data.title}
                icon={data.icon}
                data={data.data}
            />
        ))
    )
}