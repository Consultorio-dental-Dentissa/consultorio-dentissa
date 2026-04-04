import { Link, useNavigate } from 'react-router-dom';
import { FieldGroup } from '@/components/ui/field'
import { InputForm } from '@/components/common/Input'
import { useForm } from "react-hook-form"
import type { CrearUsuario } from '@/types/api/request/CrearUsuario';
import toast from 'react-hot-toast';
import { useRegister } from '@/hooks/useRegister';

export default function Registrarse() {

    const navigate = useNavigate();
    const registerHook = useRegister();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CrearUsuario>()

    const manejarSubmit = async (usuario: CrearUsuario) => {
        console.log(usuario);

        try {
            await registerHook.register(usuario);
            toast.success('Te has registrado exitosamente');

            setTimeout(() => {
                navigate('/login');

            }, 2000)

        } catch (error) {
            toast.error(error as string);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h2>Crear una cuenta</h2>
                    <p>Completa tus datos para registrarte</p>
                </div>

                <form onSubmit={handleSubmit(manejarSubmit)} className="auth-form">

                    <FieldGroup className="flex-row">

                        <InputForm
                            label="Nombre"
                            placeholder='Ingresa tu nombre porfavor'
                            registration={register('nombre', { required: 'El nombre es obligatorio' })}
                            error={errors.nombre?.message}
                        />

                        <InputForm
                            label="Apellido"
                            placeholder='Ingresa tu apellido porfavor'
                            registration={register('apellido', { required: 'El apellido es obligatorio' })}
                            error={errors.apellido?.message}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            label="Correo electronico"
                            placeholder='Ingresa tu correo porfavor'
                            registration={register('correo', {
                                required: 'El correo es obligatorio',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'El correo debe tener el formato de nombre@dominio.com'
                                }
                            })}
                            error={errors.correo?.message}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            label="Contraseña"
                            placeholder='La contraseña debe tener minimo 8 caracteres'
                            registration={register('contraseña', {
                                required: 'La contraseña es obligatoria',
                                minLength: { value: 8, message: 'La contraseña debe tener minimo 8 caracteres' }
                            })}
                            error={errors.contraseña?.message}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            type="tel"
                            label="Telefono"
                            placeholder='Ingresa tu telefono porfavor'
                            registration={register('telefono', {
                                required: 'Este campo es obligatorio',
                                minLength: { value: 10, message: 'El teléfono debe tener exactamente 10 dígitos' },
                                maxLength: { value: 10, message: 'El teléfono debe tener exactamente 10 dígitos' },
                                pattern: { value: /^\d+$/, message: 'El teléfono solo debe contener números' }
                            })}
                            error={errors.telefono?.message}
                        />

                        <InputForm
                            type="tel"
                            label="Telefono de emergencia"
                            placeholder='Ingresa tu telefono de emergencia'
                            registration={register('paciente.telefono_emergencia', {
                                required: 'Este campo es obligatorio',
                                minLength: { value: 10, message: 'El teléfono debe tener exactamente 10 dígitos' },
                                maxLength: { value: 10, message: 'El teléfono debe tener exactamente 10 dígitos' },
                                pattern: { value: /^\d+$/, message: 'El teléfono solo debe contener números' }
                            })}
                            error={errors.paciente?.telefono_emergencia?.message}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            label="Direccion"
                            placeholder='Ingresa tu direccion porfavor'
                            registration={register('paciente.direccion', {
                                required: 'Este campo es obligatorio',
                            })}
                            error={errors.paciente?.direccion?.message}
                        />

                        <InputForm
                            type='date'
                            label="Fecha de nacimiento"
                            placeholder='Ingresa tu fecha de nacimiento porfavor'
                            registration={register('paciente.fecha_nacimiento', {
                                required: 'Este campo es obligatorio',
                            })}
                            error={errors.paciente?.fecha_nacimiento?.message}
                        />

                    </FieldGroup>


                    <button type="submit" className="auth-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Cargando...' : "Registrarse"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    );
}