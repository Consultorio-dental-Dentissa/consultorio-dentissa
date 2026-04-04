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
            delete data.paciente;
        }
        console.log(data);
        onSubmit(data);
    }

    return (
        <form className="flex flex-col gap-7" onSubmit={handleSubmit(manejarSubmit)}>
            <FieldGroup className="flex-row">

                <InputForm
                    label="Nombre"
                    placeholder="Ingresa tu nombre"
                    error={errors?.nombre?.message}
                    registration={register('nombre', { required: 'El nombre es obligatorio' })}
                />

                <InputForm
                    label="Apellido"
                    placeholder="Ingresa tu apellido"
                    error={errors?.apellido?.message}
                    registration={register('apellido', { required: 'El apellido es obligatorio' })}
                />

            </FieldGroup>
            <FieldGroup className="flex-row">

                <InputForm
                    label="Correo electronico"
                    placeholder="Ingresa tu correo electronico"
                    error={errors?.correo?.message}
                    registration={register('correo', {
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
                    error={errors?.telefono?.message}
                    registration={register('telefono', { required: 'El telefono es obligatorio' })}
                />

            </FieldGroup>

            <FieldGroup className="flex-row">

                <InputForm
                    type="password"
                    label="Contraseña"
                    placeholder="La contraseña debe incluir minimo 8 caracteres"
                    error={errors?.contraseña?.message}
                    registration={register('contraseña', {
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
                            error={errors?.paciente?.direccion?.message}
                            registration={register('paciente.direccion', { required: 'La diraccion es obligatoria' })}
                        />

                        <InputForm
                            label="Telefono de emergencia"
                            placeholder="Ingrese su telefono de emergencia"
                            error={errors?.paciente?.telefono_emergencia?.message}
                            registration={register('paciente.telefono_emergencia', {
                                required: 'El telefono de emergencia es obligatorio'
                            })}
                        />

                    </FieldGroup>

                    <FieldGroup className="flex-row">

                        <InputForm
                            type="date"
                            label="Fecha de nacimiento"
                            placeholder="Ingrese su fecha de nacimiento"
                            error={errors?.paciente?.fecha_nacimiento?.message}
                            registration={register('paciente.fecha_nacimiento', {
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