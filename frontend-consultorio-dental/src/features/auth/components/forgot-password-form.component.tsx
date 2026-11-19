import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MailCheck } from "lucide-react";
import { InputForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useForgotPassword } from "@/features/auth/hooks/use-account";
import { emailSchema } from "@/utils/validation";
import { ApiError } from "@/services/api";

const schema = z.object({ email: emailSchema });
type ForgotInput = z.infer<typeof schema>;

export function ForgotPasswordForm() {
    const mutation = useForgotPassword();
    const [sent, setSent] = useState(false);
    const [formError, setFormError] = useState<{ message: string; unavailable: boolean } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotInput>({ resolver: zodResolver(schema) });

    const onSubmit = ({ email }: ForgotInput) => {
        setFormError(null);

        mutation.mutate(email, {
            onSuccess: () => setSent(true),
            onError: (error) =>
                setFormError({
                    message: error.message,
                    unavailable: error instanceof ApiError && error.code === "unavailable",
                }),
        });
    };

    if (sent) {
        return (
            <div role="status" className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success">
                    <MailCheck className="size-6" aria-hidden="true" />
                </span>
                <p className="font-semibold">Revisa tu correo</p>
                <p className="text-sm text-muted-foreground">
                    Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. El enlace caduca pronto.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {formError && (
                <Alert
                    variant={formError.unavailable ? "warning" : "error"}
                    title={formError.unavailable ? "Recuperación no disponible" : undefined}
                >
                    {formError.unavailable
                        ? "Por ahora no podemos enviar correos de recuperación. Contacta al consultorio para restablecer tu contraseña."
                        : formError.message}
                </Alert>
            )}

            <InputForm variant="auth"
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                placeholder="nombre@correo.com"
                registration={register("email")}
                error={errors.email?.message}
            />

            <Button type="submit" variant="brand" size="great" className="mt-1 w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner /> : "Enviar enlace"}
            </Button>
        </form>
    );
}
