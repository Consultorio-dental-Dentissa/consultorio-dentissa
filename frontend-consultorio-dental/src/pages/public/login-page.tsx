import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/use-login";
import { FieldGroup } from '@/components/ui/field'
import { InputForm } from '@/components/common/input.component'
import { useForm } from "react-hook-form"
import toast from "react-hot-toast";
import type { LoginDto } from "@/types/api/request/login.dto";
import { useAuth } from "@/context/auth-context-provider";

export default function LoginPage() {

    const navigate = useNavigate();
    const { login, error, isLoading } = useLogin();
    const { saveUserData } = useAuth();

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<LoginDto>()
    

    const handleFormSubmit = async (credentials: LoginDto) => {
        const userLogged = await login(credentials);

        if (userLogged && userLogged.user) {
            saveUserData(userLogged.user);
            navigate('/dashboard');
        }

    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Bienvenido de nuevo</h2>
                    <p>Inicia sesión para acceder a tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
                    
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

                    <div className="form-options">
                        <Link to="/recuperar-password" className="forgot-password">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? 'Cargando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes una cuenta? <Link to="/registrate">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
}