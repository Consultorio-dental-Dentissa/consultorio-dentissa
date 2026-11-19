import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { User } from "@/features/users/types/user.model";

interface UserStatusToggleProps {
    user: User;
    isSelf: boolean;
    onToggleStatus: (user: User) => void;
}

/** Interruptor + texto de estatus (verde si está activo, gris si no), como en Usuarios.dc.html. */
export function UserStatusToggle({ user, isSelf, onToggleStatus }: UserStatusToggleProps) {
    return (
        <div className="flex items-center gap-2.5">
            <Switch
                checked={user.status}
                disabled={isSelf}
                onCheckedChange={() => onToggleStatus(user)}
                aria-label={
                    isSelf
                        ? "No puedes cambiar tu propio estado"
                        : `${user.status ? "Desactivar" : "Activar"} a ${user.name} ${user.lastname}`
                }
            />
            <span className={cn("text-[14.5px] font-semibold", user.status ? "text-[#16a34a]" : "text-ink-4")}>
                {user.status ? "Activo" : "Inactivo"}
            </span>
        </div>
    );
}
