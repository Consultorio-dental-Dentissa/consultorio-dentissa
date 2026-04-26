import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/types/models/user";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";

import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit2 } from "react-icons/fi";

import { formatFirstLetterUppercase } from "@/utils/formatters";
import { formatPhone } from "@/utils/formatters";

export const getColumns = (onToggleStatus?: (id: number, status: boolean) => void): ColumnDef<User>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={value => row.toggleSelected(!!value)}
                aria-label='Select row'
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        header: "Nombre del usuario",
        cell: ({ row }) => (
            <div className="flex flex-col font-medium">
                <p>{`${row.original.name} ${row.original.lastname}`}</p>
                <p className="font-normal text-gray-500">{`ID: ${row.original.id}`}</p>
            </div>
        )
    },
    {
        header: "Correo",
        cell: ({ row }) => <div>{row.original.email}</div>
    },
    {
        header: "Telefono",
        cell: ({ row }) => <div>{formatPhone(row.original.phone)}</div>
    },
    {
        header: "Rol",
        cell: ({ row }) => <div>{formatFirstLetterUppercase(row.original.role)}</div>
    },
    {
        header: 'Estado',
        cell: ({ row }) => (
            <div>
                <Switch 
                    checked={row.original.status} 
                    onClick={() => onToggleStatus && onToggleStatus(row.original.id, !row.original.status)} 
                />
            </div>  
        )
    },
    {
        header: "Fecha de registro",
        cell: ({row}) => <div>{row.original.created_at.toDateString()}</div>
    },
    {
        header: "Acciones",
        cell: () => (
            <div className="flex gap-2 justify-center">
                <Button variant="secondary"><FiEdit2 /></Button>
                <Button variant="destructive"><FaRegTrashCan /></Button>
            </div>
        )
    }
];
