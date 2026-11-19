import { Link } from "react-router-dom";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form.component";
import { AuthCard } from "@/features/auth/components/auth-card.component";

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Recupera tu contraseña"
            description="Escribe tu correo y te enviaremos un enlace para crear una nueva."
            footer={
                <Link to="/login" className="font-bold text-brand hover:text-brand-hover">
                    Volver a iniciar sesión
                </Link>
            }
        >
            <ForgotPasswordForm />
        </AuthCard>
    );
}
