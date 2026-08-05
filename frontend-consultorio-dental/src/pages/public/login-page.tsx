import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/use-login";
import { FieldGroup } from '@/components/ui/field'
import { InputForm } from '@/components/common/input.component'
import { useForm } from "react-hook-form"
import { useAuth } from "@/context/auth-context-provider";

import type { LoginDto } from "@/types/api/request/login.dto";

import toast from "react-hot-toast";

export default function LoginPage() {

    const navigate = useNavigate();
    const { useLoginUser, error, isLoading } = useLogin();
    const { saveUserData } = useAuth();

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginDto>()


    const handleFormSubmit = async (credentials: LoginDto) => {
        const userLogged = await useLoginUser(credentials);

        if (userLogged && userLogged.user) {
            saveUserData(userLogged.user);
            navigate('/dashboard');
        }

    }

    return (
        <div className="flex bg-gray-50 justify-center mt-10 items-center h-full">
            <div className="bg-white w-[30%] p-10 shadow-card">
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

                    <button 
                        type="submit" 
                        className="bg-rose-400 text-white rounded-lg font-bold p-3 transition-shadow duration-300 hover:shadow-lg hover:shadow-rose-300" 
                        disabled={isLoading}>
                        {isLoading ? 'Cargando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="text-center mt-5 pt-5 border-t-2">
                    <p className="text-md">¿No tienes una cuenta? <Link to="/registrate" className="text-rose-400 font-bold">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
}