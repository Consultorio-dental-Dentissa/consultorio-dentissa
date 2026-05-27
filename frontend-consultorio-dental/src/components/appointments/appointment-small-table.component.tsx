import type { Appointment } from "@/types/models/appointment"
import { StatusSpan } from "../common/span.component"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../common/data-table.component"


interface AppointmentSmallTableProps {
    appointments: Appointment[]
}


/* Table columns */
const columns = (): ColumnDef<Appointment>[] => [
        {
            header: 'Fecha programada',
            cell: ({ row }) => <div> {row.original.date.toDateString()} </div>
        },
        {
            header: 'Horario',
            cell: ({ row }) => <div> {row.original.time} </div>
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
    
    return (
        <DataTable
            columns={columns()}
            data={appointments}
        />
    )
}