import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { InputForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { canVisitRoute, getHomeRoute } from "@/config/navigation";

const loginSchema = z.object({
    email: z.string().trim().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (credentials: LoginInput) => {
        setFormError(null);

        try {
            const user = await login(credentials);
            const from = (location.state as { from?: string } | null)?.from;
            toast.success(`Bienvenido, ${user.name}`);
            // `from` solo se respeta si el rol del usuario que inicia sesión puede ver esa ruta.
            const canVisitFrom = typeof from === "string" && canVisitRoute(user.role, from);
            navigate(canVisitFrom ? from : getHomeRoute(user.role), { replace: true });
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "No se pudo iniciar sesión");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <InputForm
                label="Correo electrónico"
                variant="auth"
                type="email"
                autoComplete="email"
                placeholder="nombre@correo.com"
                registration={register("email")}
                error={errors.email?.message}
            />

            <InputForm
                label="Contraseña"
                variant="auth"
                type="password"
                autoComplete="current-password"
                placeholder="Tu contraseña"
                registration={register("password")}
                error={errors.password?.message}
            />

            <div className="-mt-1 flex justify-end">
                <Link to="/olvide-mi-contrasena" className="text-[15px] font-bold text-brand hover:text-brand-hover">
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>

            <Button type="submit" variant="brand" size="great" className="mt-1 w-full" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : "Iniciar sesión"}
            </Button>
        </form>
    );
}
