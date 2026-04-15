import { FieldGroup } from "@/components/ui/field"
import { Rol } from "@/types/enums/rol-enum"
import { useForm, Controller } from "react-hook-form"
import { InputForm, SelectForm } from "@/components/common/Input"
import { PrimaryButton, SecondaryButton } from "../common/Button"

import type { SelectData } from "@/components/common/SelectComponent"
import type { CrearUsuario } from "@/types/api/request/CrearUsuario"

interface UsuarioFormProps {
    onSubmit: (data: CrearUsuario) => void
    onCancel: () => void
}

const roles: SelectData[] = [
    {
        value: 'ADMINISTRADOR',
        data: 'Administrador'
    },
    {
        value: 'ASISTENTE',
        data: 'Asistente'
    },
    {
        value: 'PACIENTE',
        data: 'Paciente'
    }
];

export default function CrearUsuarioForm({ onSubmit, onCancel }: UsuarioFormProps) {

    const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<CrearUsuario>()

    const rolActual = watch('rol');
    const esPaciente = rolActual === Rol.PACIENTE;

    const manejarSubmit = (data: CrearUsuario) => {
        if (!esPaciente) {
            delete data.patient;
        }
        console.log("Datos a ennviar: ", data);
        onSubmit(data);
    }

    return (
        <form className="flex flex-col gap-7" onSubmit={handleSubmit(manejarSubmit)}>
            <FieldGroup className="flex-row">

                <InputForm
                    label="Nombre"
                    placeholder="Ingresa tu nombre"
                    error={errors?.name?.message}
                    registration={register('name', { required: 'El nombre es obligatorio' })}
                />

                <InputForm
                    label="Apellido"
                    placeholder="Ingresa tu apellido"
                    error={errors?.lastname?.message}
                    registration={register('lastname', { required: 'El apellido es obligatorio' })}
                />

            </FieldGroup>
            <FieldGroup className="flex-row">

                <InputForm
                    label="Correo electronico"
                    placeholder="Ingresa tu correo electronico"
                    error={errors?.email?.message}
                    registration={register('email', {
                        required: 'El correo es obligatorio',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'El correo no es válido'
                        }
                    })}
                />

                <InputForm
                    label="Telefono"
                    placeholder="Ingresa tu telefono"
                    error={errors?.phone?.message}
                    registration={register('phone', { required: 'El telefono es obligatorio' })}
                />

            </FieldGroup>

            <FieldGroup className="flex-row">

                <InputForm
                    type="password"
                    label="Contraseña"
                    placeholder="La contraseña debe incluir minimo 8 caracteres"
                    error={errors?.password?.message}
                    registration={register('password', {
                        required: 'La contraseña es obligatoria',
                        minLength: { value: 8, message: 'La contraseña debe tener minimo 8 caracteres' }
                    })}
                />

                    <Controller
                        control={control}
                        name="rol"
                        rules={{ required: 'El rol es obligatorio' }}
                        render={({ field }) => (

                            <SelectForm
                                label="Rol"
                                title='Roles'
                                placeholder="Seleccione un rol"
                                DATA={roles}
                                onChange={field.onChange}
                                value={field.value}
                                error={errors.rol?.message}
                            />
                        )}
                    />
            </FieldGroup>

            <hr />

            {esPaciente && (
                <>
                    <FieldGroup className="flex-row">
                        <InputForm
                            label="Dirección"
                            placeholder="La dirección es obligatoria"
                            error={errors?.patient?.address?.message}
                            registration={register('patient.address', { required: 'La diraccion es obligatoria' })}
                        />

                        <InputForm
                            label="Telefono de emergencia"
                            placeholder="Ingrese su telefono de emergencia"
                            error={errors?.patient?.emergency_phone?.message}
                            registration={register('patient.emergency_phone', {
                                required: 'El telefono de emergencia es obligatorio'
                            })}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            type="date"
                            label="Fecha de nacimiento"
                            placeholder="Ingrese su fecha de nacimiento"
                            error={errors?.patient?.birth_date?.message}
                            registration={register('patient.birth_date', {
                                required: 'La fecha de nacimiento es obligatoria'
                            })}
                        />

                    </FieldGroup>
                </>
            )
            }

            <div className="flex justify-end gap-2 mt-2">
                {/* <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Cargando...' : 'Crear usuario'}</Button> */}

                <SecondaryButton message="Cancelar" onClick={onCancel} type="button"/>
                <PrimaryButton message="Crear usuario" disabled={isSubmitting} type="submit"/>
            </div>
        </form>
    )
}