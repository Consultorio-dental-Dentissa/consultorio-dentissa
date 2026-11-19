import { Link, Navigate } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/login-form.component";
import { AuthCard } from "@/features/auth/components/auth-card.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getHomeRoute } from "@/config/navigation";

export default function LoginPage() {
    const { user } = useAuth();

    if (user) return <Navigate to={getHomeRoute(user.role)} replace />;

    return (
        <AuthCard
            title="Bienvenido de nuevo"
            description="Inicia sesión para ver y agendar tus citas"
            footer={
                <>
                    ¿Aún no tienes cuenta?{" "}
                    <Link to="/registrate" className="font-bold text-brand hover:text-brand-hover">
                        Crear cuenta
                    </Link>
                </>
            }
        >
            <LoginForm />
        </AuthCard>
    );
}
