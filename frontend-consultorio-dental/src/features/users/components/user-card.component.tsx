import { Pencil } from "lucide-react";
import { RoleBadge } from "@/components/shared/status-badge.component";
import { Button } from "@/components/ui/button";
import { UserStatusToggle } from "@/features/users/components/user-status-toggle.component";
import { formatPhone } from "@/utils/formatters";
import type { User } from "@/features/users/types/user.model";

interface UserCardProps {
    user: User;
    isSelf: boolean;
    onToggleStatus: (user: User) => void;
    onEdit: (user: User) => void;
}

/** Versión en tarjeta de una fila de usuarios para pantallas pequeñas. */
export function UserCard({ user, isSelf, onToggleStatus, onEdit }: UserCardProps) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[15.5px] font-bold">{user.name} {user.lastname}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-4">{user.email}</p>
                    <p className="mt-1 text-[15px] text-ink-2">{formatPhone(user.phone)}</p>
                </div>
                <RoleBadge role={user.role} />
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-line-row pt-3">
                <UserStatusToggle user={user} isSelf={isSelf} onToggleStatus={onToggleStatus} />
                <Button
                    variant="secondary" size="icon-sm" onClick={() => onEdit(user)}
                    title="Editar" aria-label={`Editar a ${user.name} ${user.lastname}`}
                >
                    <Pencil />
                </Button>
            </div>
        </div>
    );
}
