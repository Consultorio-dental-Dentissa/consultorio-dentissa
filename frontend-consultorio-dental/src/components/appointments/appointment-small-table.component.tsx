import type { Appointment } from "@/types/models/appointment"
import { StatusSpan } from "../common/span.component"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../common/data-table.component"
import { formatDate } from "@/utils/formatters"


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


export function AppointmentSmallTable({ appointments }: AppointmentSmallTableProps) {
    
    console.log("CITAS:", appointments);

    return (
        <DataTable
            columns={columns()}
            data={appointments}
        />
    )
}