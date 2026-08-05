import type { ColumnDef } from "@tanstack/react-table"
import type { Service } from "@/features/services/types/service"

import { formatTotalMinutesToHours } from "@/utils/formatters"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ActiveSpan } from "@/components/shared/span.component"

import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit2 } from "react-icons/fi";

export const getServicesColumns = (
    updateStatus: (serviceId: number, status: boolean) => void

): ColumnDef<Service>[] => [
        {
            header: 'Nombre',
            cell: ({ row }) => <div className="font-medium"> {row.original.name} </div>
        },
        {
            header: 'Duración total',
            cell: ({ row }) => <div> {formatTotalMinutesToHours(row.original.durationMinutes)} </div>
        },
        {
            header: 'Precio del servicio',
            cell: ({ row }) => <div>${row.original.price}</div>
        },
        {
            header: 'ESTADO',
            cell: ({ row }) => (
                <Switch
                    checked={row.original.status}
                    onClick={() => updateStatus(row.original.id, !row.original.status)}
                />
            )
        },
        {
            header: 'Estado',
            cell: ({ row }) => (
                <div>
                    {row.original.description}
                </div>
            )
        },
        {
            header: 'Acciones',
            cell: () => (
                <div className="flex gap-2">
                    <Button variant='destructive'><FaRegTrashCan /></Button>
                    <Button variant='secondary'><FiEdit2 /></Button>
                </div>
            )
        }
    ]