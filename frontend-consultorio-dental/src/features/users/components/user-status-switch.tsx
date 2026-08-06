import { useUpdateUserStatus } from "@/features/users/hooks/use-users";
import { Switch } from "@/components/ui/switch";
import type { User } from "@/features/users/types/user.model";
import toast from "react-hot-toast";

export function UserStatusSwitch({ user }: { user: User }) {
    const updateUserStatus = useUpdateUserStatus();

    return (
        <Switch
            checked={user.status}
            disabled={updateUserStatus.isPending}
            onClick={() =>
                updateUserStatus.mutate({ id: user.id, status: !user.status }, {
                        onSuccess: () => toast.success('El estado se actualizó correctamente'),
                        onError: (error) => toast.error(error.message),
                    }
                )
            }
        />
    );
}
