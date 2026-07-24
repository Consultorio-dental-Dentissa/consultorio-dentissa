import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/types/models/user";

import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

import { Trash2, SquarePen } from "lucide-react";
import { StatusSpan } from "../common/span.component";

import { formatPhone } from "@/utils/formatters";

export const getColumns = (onToggleStatus?: (id: number, status: boolean) => void): ColumnDef<User>[] => [

    {
        header: "Usuario",
        cell: ({ row }) => (
            <div className="flex flex-col font-medium px-2">
                <p className="font-bold text-md">{`${row.original.name} ${row.original.lastname}`}</p>
                <p className="font-normal text-gray-500">{`ID: ${row.original.id}`}</p>
            </div>
        )
    },

    {
        header: "Rol",
        cell: ({ row }) =>  <StatusSpan status={row.original.role}/>
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
        header: "Fecha de registro",
        cell: ({ row }) => <div>{row.original.created_at.toDateString()}</div>
    },
    {
        header: 'Estado',
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Switch
                    checked={row.original.status}
                    onClick={() => onToggleStatus && onToggleStatus(row.original.id, !row.original.status)}
                />
            </div>
        )
    },
    {
        header: "Acciones",
        cell: () => (
            <div className="flex gap-2 justify-center">
                <Button variant="secondary"><SquarePen /></Button>
                <Button variant="destructive"><Trash2 /></Button>
            </div>
        )
    }
];
