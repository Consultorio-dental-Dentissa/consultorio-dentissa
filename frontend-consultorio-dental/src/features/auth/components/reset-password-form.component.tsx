import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { InputForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useResetPassword } from "@/features/auth/hooks/use-account";
import { passwordSchema, PASSWORD_MIN_LENGTH } from "@/utils/validation";

const schema = z
    .object({
        newPassword: passwordSchema,
        confirm_password: z.string().min(1, "Confirma tu contraseña"),
    })
    .refine((data) => data.newPassword === data.confirm_password, {
        path: ["confirm_password"],
        message: "Las contraseñas no coinciden",
    });

type ResetInput = z.infer<typeof schema>;

export function ResetPasswordForm() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const navigate = useNavigate();
    const mutation = useResetPassword();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetInput>({ resolver: zodResolver(schema) });

    if (!token) {
        return (
            <div className="flex flex-col gap-4">
                <Alert title="Enlace no válido">
                    Este enlace está incompleto. Solicita uno nuevo desde la pantalla de recuperación.
                </Alert>
                <Button asChild variant="outline">
                    <Link to="/olvide-mi-contrasena">Solicitar un enlace nuevo</Link>
                </Button>
            </div>
        );
    }

    const onSubmit = ({ newPassword }: ResetInput) => {
        setFormError(null);

        mutation.mutate(
            { token, newPassword },
            {
                onSuccess: () => {
                    toast.success("Tu contraseña fue actualizada. Inicia sesión con la nueva.");
                    navigate("/login", { replace: true });
                },
                onError: (error) => setFormError(error.message),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <InputForm variant="auth"
                label="Nueva contraseña" required type="password" autoComplete="new-password"
                placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
                registration={register("newPassword")} error={errors.newPassword?.message}
            />
            <InputForm variant="auth"
                label="Confirmar contraseña" required type="password" autoComplete="new-password"
                registration={register("confirm_password")} error={errors.confirm_password?.message}
            />

            <Button type="submit" variant="brand" size="great" className="mt-1 w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner /> : "Guardar contraseña"}
            </Button>
        </form>
    );
}
