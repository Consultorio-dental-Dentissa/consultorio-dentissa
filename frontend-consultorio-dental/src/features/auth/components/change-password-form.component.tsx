import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { InputForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useChangePassword } from "@/features/auth/hooks/use-account";
import { passwordSchema, PASSWORD_MIN_LENGTH } from "@/utils/validation";

const schema = z
    .object({
        currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
        newPassword: passwordSchema,
        confirm_password: z.string().min(1, "Confirma la nueva contraseña"),
    })
    .refine((data) => data.newPassword === data.confirm_password, {
        path: ["confirm_password"],
        message: "Las contraseñas no coinciden",
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
        path: ["newPassword"],
        message: "La nueva contraseña debe ser distinta a la actual",
    });

type PasswordInput = z.infer<typeof schema>;

interface ChangePasswordFormProps {
    /** Dentro de un modal: se ejecuta tras cambiar la contraseña. */
    onSuccess?: () => void;
    /** Dentro de un modal: muestra el botón Cancelar y el pie del modal. */
    onCancel?: () => void;
}

export function ChangePasswordForm({ onSuccess, onCancel }: ChangePasswordFormProps = {}) {
    const mutation = useChangePassword();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordInput>({ resolver: zodResolver(schema) });

    const onSubmit = ({ currentPassword, newPassword }: PasswordInput) => {
        setFormError(null);

        mutation.mutate(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    toast.success("Tu contraseña fue actualizada");
                    reset();
                    onSuccess?.();
                },
                onError: (error) => setFormError(error.message),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={onCancel ? "flex flex-col gap-5" : "flex max-w-xl flex-col gap-5"} noValidate>
            {formError && <Alert>{formError}</Alert>}

            <InputForm
                label="Contraseña actual" required type="password" autoComplete="current-password"
                registration={register("currentPassword")} error={errors.currentPassword?.message}
            />
            <InputForm
                label="Nueva contraseña" required type="password" autoComplete="new-password"
                hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`}
                registration={register("newPassword")} error={errors.newPassword?.message}
            />
            <InputForm
                label="Confirmar nueva contraseña" required type="password" autoComplete="new-password"
                registration={register("confirm_password")} error={errors.confirm_password?.message}
            />

            <div className={onCancel ? "form-footer" : undefined}>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Spinner />} Cambiar contraseña
                </Button>
            </div>
        </form>
    );
}
