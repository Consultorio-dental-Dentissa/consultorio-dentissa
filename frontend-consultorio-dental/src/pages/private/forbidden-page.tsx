import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getHomeRoute } from "@/config/navigation";

export default function ForbiddenPage() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                <ShieldAlert className="size-8" aria-hidden="true" />
            </span>
            <div>
                <h1 className="text-2xl font-bold">No tienes acceso a esta sección</h1>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Tu rol no incluye permisos para ver esta pantalla. Si crees que es un error, contacta al administrador.
                </p>
            </div>
            <Button asChild>
                <Link to={user ? getHomeRoute(user.role) : "/login"}>Volver al inicio</Link>
            </Button>
        </div>
    );
}
