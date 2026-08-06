import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/features/users/types/user.model";

import { Button } from "@/components/ui/button";
import { UserStatusSwitch } from "@/features/users/components/user-status-switch";
import { StatusSpan } from "@/components/shared/span.component";
import { formatPhone, formatDate } from "@/utils/formatters";
import { Trash, Edit } from "lucide-react"

export const getUsersTableColumns = (): ColumnDef<User>[] => [
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
        cell: ({ row }) => <UserStatusSwitch user={row.original} />
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
