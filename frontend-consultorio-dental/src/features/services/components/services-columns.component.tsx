import type { ColumnDef } from "@tanstack/react-table"
import type { Service } from "@/features/services/types/service.model"

import { formatTotalMinutesToHours } from "@/utils/formatters"
import { Button } from "@/components/ui/button"

import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit2 } from "react-icons/fi";
import { ServiceStatusSwitch } from "./service-status-switch.component"

export const getServicesColumns = (): ColumnDef<Service>[] => [
        {
            header: 'NOMBRE',
            cell: ({ row }) => <div className="font-medium"> {row.original.name} </div>
        },
        {
            header: 'DURACIÓN',
            cell: ({ row }) => <div> {formatTotalMinutesToHours(row.original.durationMinutes)} </div>
        },
        {
            header: 'PRECIO',
            cell: ({ row }) => <div>${row.original.price}</div>
        },
        {
            header: 'ESTADO',
            cell: ({ row }) => <ServiceStatusSwitch service={row.original} />
        },
        {
            header: 'ACCIONES',
            cell: () => (
                <div className="flex gap-2">
                    <Button variant='destructive'><FaRegTrashCan /></Button>
                    <Button variant='secondary'><FiEdit2 /></Button>
                </div>
            )
        }
    ]