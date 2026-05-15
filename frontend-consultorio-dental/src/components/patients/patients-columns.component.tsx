import type { ColumnDef } from "@tanstack/react-table"
import type { Patient } from "@/types/models/patient"
import { formatPhone } from "@/utils/formatters"
import { Button } from "../ui/button"


export const getPatientsColumns = (
    openModal: () => void,
    setCurrentPatient: (patient: Patient) => void
): ColumnDef<Patient>[] => [
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
        }
    ]