import { Link, useNavigate } from 'react-router-dom';
import { FieldGroup } from '@/components/ui/field'
import { InputForm } from '@/components/common/input.component'
import { useForm } from "react-hook-form"
import { useRegister } from '@/hooks/use-register';
import { useEffect } from 'react';
import type { CreateUserDto } from '@/types/api/request/create-user.dto';
import toast from 'react-hot-toast';

export default function RegisterPage() {

    const navigate = useNavigate();
    const { useSignIn, error } = useRegister();
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<CreateUserDto>()

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    const handleFormSubmit = async (userData: CreateUserDto) => {
        const isUserRegistered = await useSignIn(userData);

        if (isUserRegistered) {
            toast.success('Te has registrado exitosamente');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    }

    return (
        <div className="bg-gray-50 flex justify-center">
            <div className="flex flex-col w-[50%] bg-white p-10 shadow-card">
                <div className="flex flex-col items-center gap-3">
                    <h2 className='font-bold text-3xl'>Crea tu cuenta cuenta</h2>
                    <p>Completa tus datos para registrarte</p>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5 mt-5">

                    <FieldGroup className="flex-row">

                        <InputForm
                            label="Nombre"
                            placeholder='Ingresa tu nombre porfavor'
                            registration={register('name', { required: 'El nombre es obligatorio' })}
                            error={errors.name?.message}
                        />

                        <InputForm
                            label="Apellido"
                            placeholder='Ingresa tu apellido porfavor'
                            registration={register('lastname', { required: 'El apellido es obligatorio' })}
                            error={errors.lastname?.message}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            label="Correo electronico"
                            placeholder='Ingresa tu correo porfavor'
                            registration={register('email', {
                                required: 'El correo es obligatorio',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'El correo debe tener el formato de nombre@dominio.com'
                                }
                            })}
                            error={errors.email?.message}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            label="Contraseña"
                            placeholder='La contraseña debe tener minimo 8 caracteres'
                            registration={register('password', {
                                required: 'La contraseña es obligatoria',
                                minLength: { value: 8, message: 'La contraseña debe tener minimo 8 caracteres' }
                            })}
                            error={errors.password?.message}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            type="tel"
                            label="Telefono"
                            placeholder='Ingresa tu telefono porfavor'
                            registration={register('phone', {
                                required: 'Este campo es obligatorio',
                                minLength: { value: 10, message: 'El teléfono debe tener exactamente 10 dígitos' },
                                maxLength: { value: 10, message: 'El teléfono debe tener exactamente 10 dígitos' },
                                pattern: { value: /^\d+$/, message: 'El teléfono solo debe contener números' }
                            })}
                            error={errors.phone?.message}
                        />

                        <InputForm
                            type="tel"
                            label="Telefono de emergencia"
                            placeholder='Ingresa tu telefono de emergencia'
                            registration={register('patient.emergency_phone', {
                                required: 'Este campo es obligatorio',
                                minLength: { value: 10, message: 'El teléfono debe tener exactamente 10 dígitos' },
                                maxLength: { value: 10, message: 'El teléfono debe tener exactamente 10 dígitos' },
                                pattern: { value: /^\d+$/, message: 'El teléfono solo debe contener números' }
                            })}
                            error={errors.patient?.emergency_phone?.message}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            label="Direccion"
                            placeholder='Ingresa tu direccion porfavor'
                            registration={register('patient.address', {
                                required: 'Este campo es obligatorio',
                            })}
                            error={errors.patient?.address?.message}
                        />

                        <InputForm
                            type='date'
                            label="Fecha de nacimiento"
                            placeholder='Ingresa tu fecha de nacimiento porfavor'
                            registration={register('patient.birth_date', {
                                required: 'Este campo es obligatorio',
                            })}
                            error={errors.patient?.birth_date?.message}
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