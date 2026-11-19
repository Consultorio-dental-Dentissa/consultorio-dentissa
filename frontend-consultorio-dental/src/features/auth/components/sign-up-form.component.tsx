import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { InputForm } from "@/components/shared/input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSignUp } from "@/features/auth/hooks/use-account";
import {
    birthDateSchema, emailSchema, normalizePhone, passwordSchema, phoneSchema, requiredText,
    PASSWORD_MIN_LENGTH,
} from "@/utils/validation";
import { toDateInputValue } from "@/utils/formatters";

const signUpSchema = z
    .object({
        name: requiredText("El nombre"),
        lastname: requiredText("El apellido"),
        email: emailSchema,
        phone: phoneSchema("El teléfono"),
        birth_date: birthDateSchema,
        address: requiredText("La dirección", 300),
        emergency_phone: phoneSchema("El teléfono de emergencia"),
        password: passwordSchema,
        confirm_password: z.string().min(1, "Confirma tu contraseña"),
    })
    .refine((data) => data.password === data.confirm_password, {
        path: ["confirm_password"],
        message: "Las contraseñas no coinciden",
    });

type SignUpInput = z.infer<typeof signUpSchema>;

export function SignUpForm() {
    const navigate = useNavigate();
    const signUpMutation = useSignUp();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

    const onSubmit = (data: SignUpInput) => {
        setFormError(null);

        signUpMutation.mutate(
            {
                name: data.name,
                lastname: data.lastname,
                email: data.email,
                phone: normalizePhone(data.phone),
                password: data.password,
                patient: {
                    address: data.address,
                    birth_date: data.birth_date,
                    emergency_phone: normalizePhone(data.emergency_phone),
                },
            },
            {
                onSuccess: () => {
                    toast.success("Tu cuenta fue creada. Ya puedes iniciar sesión.");
                    navigate("/login", { replace: true });
                },
                onError: (error) => setFormError(error.message),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {formError && <Alert>{formError}</Alert>}

            {/* Orden y rejilla de la maqueta "Registrarse": 2 columnas, correo y contraseña a ancho completo. */}
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-[18px]">
                <InputForm variant="auth" label="Nombre(s)" required autoComplete="given-name" placeholder="Ej. María" registration={register("name")} error={errors.name?.message} />
                <InputForm variant="auth" label="Apellidos" required autoComplete="family-name" placeholder="Ej. Ramírez" registration={register("lastname")} error={errors.lastname?.message} />

                <div className="sm:col-span-2">
                    <InputForm variant="auth"
                        label="Correo electrónico" required type="email" autoComplete="email"
                        placeholder="nombre@correo.com"
                        registration={register("email")} error={errors.email?.message}
                    />
                </div>

                <InputForm variant="auth"
                    label="Teléfono" required type="tel" inputMode="tel" autoComplete="tel"
                    placeholder="55 0000 0000"
                    registration={register("phone")} error={errors.phone?.message}
                />
                <InputForm variant="auth"
                    label="Teléfono de emergencia" required type="tel" inputMode="tel"
                    placeholder="55 0000 0000"
                    registration={register("emergency_phone")} error={errors.emergency_phone?.message}
                />
                <InputForm variant="auth"
                    label="Fecha de nacimiento" required type="date" max={toDateInputValue(new Date())}
                    autoComplete="bday"
                    registration={register("birth_date")} error={errors.birth_date?.message}
                />
                <InputForm variant="auth"
                    label="Dirección" required autoComplete="street-address"
                    placeholder="Calle, número, colonia"
                    registration={register("address")} error={errors.address?.message}
                />

                <div className="sm:col-span-2">
                    <InputForm variant="auth"
                        label="Contraseña" required type="password" autoComplete="new-password"
                        placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
                        registration={register("password")} error={errors.password?.message}
                    />
                </div>
                <div className="sm:col-span-2">
                    <InputForm variant="auth"
                        label="Confirmar contraseña" required type="password" autoComplete="new-password"
                        placeholder="Repite tu contraseña"
                        registration={register("confirm_password")} error={errors.confirm_password?.message}
                    />
                </div>
            </div>

            <Button type="submit" variant="brand" size="great" className="mt-1 w-full" disabled={signUpMutation.isPending}>
                {signUpMutation.isPending ? <Spinner /> : "Crear cuenta"}
            </Button>
        </form>
    );
}
