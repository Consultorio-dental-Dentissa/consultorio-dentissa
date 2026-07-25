import type { ColumnDef } from "@tanstack/react-table"
import type { Consultation } from "@/types/models/consultation"
import { formatDate } from "@/utils/formatters"
import { Button } from "../ui/button"
import { Eye } from "lucide-react"

export const getConsultationsColumns = (onView?: (consultation: Consultation) => void): ColumnDef<Consultation>[] => [
        {
            header: 'Paciente',
            cell: ({ row }) => (
                <div className="font-medium">{`${row.original.patient.name} ${row.original.patient.lastname}`}</div>
            )
        },
        {
            header: 'Servicio',
            cell: ({ row }) => <div>{row.original.service.name}</div>
        },
        {
            header: 'Fecha',
            cell: ({ row }) => <div>{formatDate(row.original.scheduled_at)}</div>
        },
        {
            header: 'Notas',
            cell: ({ row }) => <div className="truncate">{row.original.notes}</div>
        },
        {
            header: 'Observaciones',
            cell: ({ row }) => <div className="truncate">{row.original.observations}</div>
        },
        {
            header: 'Detalles',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onView && onView(row.original)}
                    >
                        <Eye />
                    </Button>
                </div>
            )
        },
    ]
