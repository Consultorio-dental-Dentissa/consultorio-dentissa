import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/features/users/types/user";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StatusSpan } from "@/components/common/span.component";
import { formatPhone, formatDate } from "@/utils/formatters";
import { Trash, Edit } from "lucide-react"

export const getUsersTableColumns = (handleUpdateUserStatus: (id: number, status: boolean) => void): ColumnDef<User>[] => [
    {
        header: "NOMBRE",
        cell: ({ row }) => (
            <div className="flex flex-col font-medium">
                <p className="font-bold">{`${row.original.name} ${row.original.lastname}`}</p>
                <p className="font-normal text-gray-500">{`${row.original.email}`}</p>
            </div>
        )
    },
    {
        header: "ROL",
        cell: ({ row }) => <StatusSpan status={row.original.role} />
    },
    {
        header: "TELEFONO",
        cell: ({ row }) => <div>{formatPhone(row.original.phone)}</div>
    },
    {
        header: "REGISTRO",
        cell: ({ row }) => <div>{formatDate(row.original.created_at)}</div>
    },
    {
        header: 'ESTADO',
        cell: ({ row }) => (
            <Switch
                checked={row.original.status}
                onClick={() => handleUpdateUserStatus(row.original.id, !row.original.status)}
            />
        )
    },
    {
        header: "ACCIONES",
        cell: () => (
            <div className="flex gap-2">
                <Button variant="secondary"><Edit /></Button>
                <Button variant="destructive"><Trash /></Button>
            </div>
        )
    }
];
