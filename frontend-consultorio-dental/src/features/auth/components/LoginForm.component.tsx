import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context-provider";
import { useLoginUser } from "../hooks/use-login";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FieldGroup } from "@/components/ui/field";
import { InputForm } from "@/components/shared/input.component";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import type { LoginDto } from "../types/login.dto";
import toast from "react-hot-toast";

export function LoginForm() {
    const navigate = useNavigate();
    const { saveUserData } = useAuth();

    const loginUserMutation = useLoginUser();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginDto>()


    const handleFormSubmit = async (credentials: LoginDto) => {

        loginUserMutation.mutate(credentials, {
            onSuccess: (data) => {

                if (!data.user) {
                    toast.error('Sucedió un error inesperado al iniciar sesión');
                }

                saveUserData(data.user);
                navigate('/dashboard');

            },
            onError: (error) => toast.error(error.message)
        });
    }

    return (
        <>
            <div className="flex flex-col items-center">
                <h2 className="font-medium text-rose-400">Bienvenido de nuevo</h2>
                <p className="font-bold text-4xl">Inicia sesión</p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-8 mt-5">
                <FieldGroup>

                    <InputForm
                        label="Correo electronico"
                        placeholder='Ingresa tu correo porfavor'
                        registration={register('email', { required: 'El correo es obligatorio' })}
                        error={errors.email?.message}
                    />

                </FieldGroup>

                <FieldGroup>
                    <InputForm
                        label="Contraseña"
                        placeholder='Ingresa tu contraseña porfavor'
                        registration={register('password', { required: 'La contraseña es obligatoria' })}
                        error={errors.password?.message}
                    />
                </FieldGroup>

                {
                    /*
                        <div className="form-options">
                            <Link to="/recuperar-password" className="forgot-password">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    
                    */
                }

                <Button
                    type="submit"
                    variant="login"
                    size="great"
                    disabled={loginUserMutation.isPending}>
                    {loginUserMutation.isPending ? <Spinner /> : 'Iniciar sesión'}
                </Button>
            </form>

            <div className="text-center mt-5 pt-5 border-t-2">
                <p className="text-md flex justify-center gap-2">
                    ¿No tienes una cuenta?
                    <Link to="/registrate" className="text-rose-400 font-bold">Regístrate aquí</Link>
                </p>
            </div>
        </>
    );
}