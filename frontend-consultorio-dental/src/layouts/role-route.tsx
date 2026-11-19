import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";
import ForbiddenPage from "@/pages/private/forbidden-page";

interface RoleRouteProps {
    allowedRoles: readonly string[];
}

/**
 * Guarda de rol por ruta (solo UX: el backend vuelve a validar cada petición).
 * Se usa dentro de PrivateLayout, por lo que ya hay sesión.
 */
export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(user.role)) return <ForbiddenPage />;

    return <Outlet />;
}
