import type { Appointment } from "@/features/appointments/types/appointment.model"
import { StatusSpan } from "@/components/shared/span.component"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table.component"
import { formatDate } from "@/utils/formatters"
import { useAppointments } from "../hooks/use-appointments"
import { Spinner } from "@/components/ui/spinner"
import { STATUS_APPOINTMENT } from "../types/status-appointment.enum"


interface AppointmentSmallTableProps {
    appointments: Appointment[]
}


/* Table columns */
const columns = (): ColumnDef<Appointment>[] => [
        {
            header: 'Fecha programada',
            cell: ({ row }) => <div> {formatDate(row.original.scheduled_at)} </div>
        },
        {
            header: 'Horario',
            cell: ({ row }) => (
                <div>
                    {`${row.original.scheduled_at.toLocaleTimeString()} - ${row.original.scheduled_at_end.toLocaleTimeString()}`}
                </div>
            )
        },
        {
            header: 'Servicio',
            cell: ({ row }) => <div>{row.original.service.name}</div>
        },
        {
            header: 'Estatus',
            cell: ({ row }) => <StatusSpan status={row.original.status}/>
        }
    ]


export function AppointmentSmallTable({ patientId }: { patientId: number }) {
    
    const patientAppointments = useAppointments(`patient_id=${patientId}`);

    if (patientAppointments.isLoading) {
        return <Spinner />
    }

    if (!patientAppointments.data || !patientAppointments.data.length) {
        return <p>No se encontraron citas</p>
    }

    return (
        <DataTable
            columns={columns()}
            data={patientAppointments.data.filter(a => a.status != STATUS_APPOINTMENT.CANCELADA)}
        />
    )
}