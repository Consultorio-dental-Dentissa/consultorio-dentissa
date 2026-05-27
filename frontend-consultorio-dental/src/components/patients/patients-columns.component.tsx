import type { ColumnDef } from "@tanstack/react-table"
import type { Patient } from "@/types/models/patient"
import { formatPhone } from "@/utils/formatters"
import { Button } from "../ui/button"
import { ActiveSpan } from "../common/span.component"

export const getPatientsColumns = (): ColumnDef<Patient>[] => [
        {
            header: 'Nombre',
            cell: ({ row }) => (
                <div className="font-medium">{`${row.original.name} ${row.original.lastname}`}</div>
            )
        },
        {
            header: 'Correo electronico',
            cell: ({ row }) => <div>{row.original.email}</div>
        },
        {
            header: 'Telefono',
            cell: ({ row }) => (
                <div>{formatPhone(row.original.phone)}</div>
            )
        },
        {
            header: 'Telefono de emergencia',
            cell: ({ row }) => (
                <div>{formatPhone(row.original.emergency_phone)}</div>
            )
        },
        {
            header: 'Fecha de nacimiento',
            cell: ({ row }) => <div>{row.original.birth_date.toDateString()}</div>
        },
        {
            header: 'Estado',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <ActiveSpan 
                        status={true}
                    />
                </div>
            )
        },
        {
            header: 'Perfil',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button variant='secondary' className="w-full" onClick={() => 
                        document.location.href=`/pacientes/${row.original.id}`
                        }>Información
                    </Button>
                </div>
            )
        }
    ]