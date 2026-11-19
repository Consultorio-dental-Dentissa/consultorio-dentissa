import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/shared/status-badge.component";
import { UserStatusToggle } from "@/features/users/components/user-status-toggle.component";
import { formatPhone } from "@/utils/formatters";
import type { User } from "@/features/users/types/user.model";

interface UsersColumnsOptions {
    currentUserId: number;
    onToggleStatus: (user: User) => void;
    onEdit: (user: User) => void;
}

/** Columnas de Usuarios.dc.html: Nombre (con correo), Rol, Teléfono, Estatus y Acciones (editar). No hay "Eliminar": el backend no tiene DELETE. */
export function getUsersColumns({ currentUserId, onToggleStatus, onEdit }: UsersColumnsOptions): ColumnDef<User>[] {
    return [
        {
            id: "user",
            header: "Nombre",
            cell: ({ row }) => (
                <div className="min-w-0">
                    <p className="truncate text-[15.5px] font-bold">{row.original.name} {row.original.lastname}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-4">{row.original.email}</p>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => <RoleBadge role={row.original.role} />,
        },
        {
            accessorKey: "phone",
            header: "Teléfono",
            cell: ({ row }) => <span className="text-ink-2">{formatPhone(row.original.phone)}</span>,
        },
        {
            id: "status",
            header: "Estatus",
            cell: ({ row }) => (
                <UserStatusToggle
                    user={row.original}
                    isSelf={row.original.id === currentUserId}
                    onToggleStatus={onToggleStatus}
                />
            ),
        },
        {
            id: "actions",
            header: () => <span className="block text-right">Acciones</span>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="secondary" size="icon-sm" onClick={() => onEdit(row.original)}
                        title="Editar" aria-label={`Editar a ${row.original.name} ${row.original.lastname}`}
                    >
                        <Pencil />
                    </Button>
                </div>
            ),
        },
    ];
}
