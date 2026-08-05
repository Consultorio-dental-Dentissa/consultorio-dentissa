import type { ColumnDef } from "@tanstack/react-table"
import type { Patient } from "@/features/patients/types/patient"
import { formatDate, formatPhone } from "@/utils/formatters"
import { Button } from "@/components/ui/button"
import { ActiveSpan } from "@/components/common/span.component"
import { Eye } from "lucide-react"

export const getPatientsColumns = (): ColumnDef<Patient>[] => [
    {
        header: 'NOMBRE',
        cell: ({ row }) => (
            <div className="font-bold">{`${row.original.name} ${row.original.lastname}`}</div>
        )
    },
    {
        header: 'CORREO ELECTRONICO',
        cell: ({ row }) => <div>{row.original.email}</div>
    },
    {
        header: 'TELEFONO',
        cell: ({ row }) => (
            <div>{formatPhone(row.original.phone)}</div>
        )
    },
    {
        header: 'TELEFONO DE EMERGENCIA',
        cell: ({ row }) => (
            <div>{formatPhone(row.original.emergency_phone)}</div>
        )
    },
    {
        header: 'FECHA DE NACIMIENTO',
        cell: ({ row }) => <div>{formatDate(row.original.birth_date)}</div>
    },
    {
        header: 'ESTADO',
        cell: ({ row }) => (
            <ActiveSpan
                status={true}
            />
        )
    },
    {
        header: 'PERFIL',
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Button variant='secondary' className="w-full" onClick={() =>
                    document.location.href = `/pacientes/${row.original.id}`}> <Eye />
                </Button>
            </div>
        )
    }
]