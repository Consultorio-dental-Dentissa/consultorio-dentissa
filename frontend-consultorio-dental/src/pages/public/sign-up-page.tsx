import { Link, Navigate } from "react-router-dom";
import { SignUpForm } from "@/features/auth/components/sign-up-form.component";
import { AuthCard } from "@/features/auth/components/auth-card.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getHomeRoute } from "@/config/navigation";

export default function SignUpPage() {
    const { user } = useAuth();

    if (user) return <Navigate to={getHomeRoute(user.role)} replace />;

    return (
        <AuthCard
            variant="register"
            title="Crea tu cuenta"
            description="Regístrate para agendar tu primera cita"
            footer={
                <>
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="font-bold text-brand hover:text-brand-hover">
                        Iniciar sesión
                    </Link>
                </>
            }
        >
            <SignUpForm />
        </AuthCard>
    );
}
