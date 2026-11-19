import { Link } from "react-router-dom";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form.component";
import { AuthCard } from "@/features/auth/components/auth-card.component";

export default function ResetPasswordPage() {
    return (
        <AuthCard
            title="Nueva contraseña"
            description="Elige una contraseña segura que no uses en otros sitios."
            footer={
                <Link to="/login" className="font-bold text-brand hover:text-brand-hover">
                    Volver a iniciar sesión
                </Link>
            }
        >
            <ResetPasswordForm />
        </AuthCard>
    );
}
