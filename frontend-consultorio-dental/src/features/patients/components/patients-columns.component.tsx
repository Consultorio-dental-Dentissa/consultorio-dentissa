import type { ColumnDef } from "@tanstack/react-table"
import type { Patient } from "@/features/patients/types/patient.model"
import { formatDate, formatPhone } from "@/utils/formatters"
import { ActiveSpan } from "@/components/shared/span.component"
import { Link } from "react-router-dom"
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
                status={row.original.status}
            />
        )
    },
    {
        header: 'PERFIL',
        cell: ({ row }) => (
            <div className="flex">
                <Link 
                    to={`/pacientes/${row.original.id}`}
                    className="bg-gray-100 w-full flex justify-center border-2 border-gray-300 rounded-sm p-1">
                        <Eye size={19}/>
                </Link>
            </div>
        )
    }
]