import { Link, useNavigate } from 'react-router-dom';
import { FieldGroup } from '@/components/ui/field'
import { InputForm } from '@/components/shared/input.component'
import { useForm } from "react-hook-form"
import { useSignUp } from '@/features/auth/hooks/use-sign-up';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button'
import type { CreateUserDto } from '@/features/users/types/create-user.dto';
import toast from 'react-hot-toast';


export function SignUpForm() {

    const navigate = useNavigate();
    const signUpMutation = useSignUp();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CreateUserDto>()

    const handleFormSubmit = async (userData: CreateUserDto) => {
        signUpMutation.mutate(userData, {
            onSuccess: (data) => {
                if (data) {
                    toast.success('Te has registrado exitosamente');
                    setTimeout(() => {
                        navigate('/login');
                    }, 1000);
                }
            },
            onError: (error) => toast.error(error.message)
        });
    }

    return (
        <>
            <div className="flex flex-col items-center gap-3">
                <h2 className='font-bold text-3xl'>Crea tu cuenta</h2>
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


                <Button
                    variant="login"
                    size="great"
                    disabled={signUpMutation.isPending}>
                    {signUpMutation.isPending ? <Spinner /> : 'Registrarte'}
                </Button>
            </form>

            <div className="text-center mt-5 pt-5 border-t-2">
                <p className="text-md flex justify-center gap-2">
                    ¿Ya tienes una cuenta? <Link to="/login" className="text-rose-400 font-bold">Inicia sesión</Link>
                </p>
            </div>
        </>
    );
}