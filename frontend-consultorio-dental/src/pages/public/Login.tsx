import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../context/AuthContextProvider";
import { FieldGroup } from '@/components/ui/field'
import { InputForm } from '@/components/common/Input'
import { useForm } from "react-hook-form"
import type { IniciarSesion } from "@/types/api/request/IniciarSesion";
import toast from "react-hot-toast";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useLogin();
    const { iniciarSesion } = useAuth();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<IniciarSesion>()
    

    const manejarSubmit = async (credenciales: IniciarSesion) => {
        console.log(credenciales);
        
        try {

            const respuesta = await login(credenciales);

            if (respuesta.estado) {
                await iniciarSesion(respuesta.usuario, respuesta.token);
                navigate('/dashboard');
            }

        } catch(error) {
            toast.error(error as string);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Bienvenido de nuevo</h2>
                    <p>Inicia sesión para acceder a tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit(manejarSubmit)} className="auth-form">
                    
                    <FieldGroup>

                        <InputForm
                            label="Correo electronico"
                            placeholder='Ingresa tu correo porfavor'
                            registration={register('correo', { required: 'El correo es obligatorio' })}
                            error={errors.correo?.message}
                        />

                    </FieldGroup>

                    <FieldGroup>
                        <InputForm
                            label="Contraseña"
                            placeholder='Ingresa tu contraseña porfavor'
                            registration={register('contraseña', { required: 'La contraseña es obligatoria' })}
                            error={errors.contraseña?.message}
                        />
                    </FieldGroup>

                    <div className="form-options">
                        <Link to="/recuperar-password" className="forgot-password">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button type="submit" className="auth-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Cragando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes una cuenta? <Link to="/registrate">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
}