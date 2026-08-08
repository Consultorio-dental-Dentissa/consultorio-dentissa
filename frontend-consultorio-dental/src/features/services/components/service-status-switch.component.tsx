import { useUpdateServiceStatus } from "@/features/services/hooks/use-services";
import { Switch } from "@/components/ui/switch";
import type { Service } from "../types/service.model";
import toast from "react-hot-toast";

export function ServiceStatusSwitch({ service }: { service: Service}) {

    const updateServiceStatusMutation = useUpdateServiceStatus();

    return (
        <Switch
            checked={service.status}
            disabled={updateServiceStatusMutation.isPending}
            onClick={() =>
                updateServiceStatusMutation.mutate({ id: service.id, status: !service.status }, {
                        onSuccess: () => toast.success('El estado se actualizó correctamente'),
                        onError: (error) => toast.error(error.message),
                    }
                )
            }
        />
    )
}