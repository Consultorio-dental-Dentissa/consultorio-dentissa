import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup } from "../ui/field"
import { Rol } from "@/types/enums/rol-enum"
import { SelectComponent, type SelectData } from "../SelectComponent"
import { useForm, Controller } from "react-hook-form"
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

export default function UsuarioForm({ onSubmit, onCancel }: UsuarioFormProps) {

    const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<CrearUsuario>()

    const rolActual = watch('rol'); // observa el valor del rol en tiempo real
    const esPaciente = rolActual === Rol.PACIENTE;

    const manejatSubmit = (data: CrearUsuario) => {
        if (!esPaciente) {
            delete data.paciente;
        }
        onSubmit(data);
    }

    return (
        <form className="flex flex-col gap-7" onSubmit={handleSubmit(manejatSubmit)}>
            <FieldGroup className="flex-row">
                <Field>
                    <Label>Nombre</Label>
                    <Input
                        className={errors.nombre && 'border-red-600'}
                        placeholder="Ingresa tu nombre"
                        {...register('nombre', {
                            required: 'El nombre es requerido'
                        })
                        }>
                    </Input>
                    {errors.nombre && <span className="text-red-500">{errors.nombre.message}</span>}

                </Field>
                <Field>
                    <Label>Apellido</Label>
                    <Input
                        className={errors.apellido && 'border-red-600'}
                        placeholder="Ingresa tu apellido"
                        {...register('apellido', {
                            required: 'El apellido es requerido'
                        })
                        }>
                    </Input>
                    {errors.apellido && <span className="text-red-500">{errors.apellido.message}</span>}

                </Field>
            </FieldGroup>
            <FieldGroup className="flex-row">
                <Field>
                    <Label>Correo electronico</Label>
                    <Input
                        className={errors.correo && 'border-red-600'}
                        placeholder="paciente@gmail.com"
                        {...register('correo', {
                            required: 'El correo es requerido',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'El correo no es válido'
                            }
                        })
                        }>
                    </Input>
                    {errors.correo && <span className="text-red-500">{errors.correo.message}</span>}

                </Field>
                <Field>
                    <Label>Telefono</Label>
                    <Input
                        className={errors.telefono && 'border-red-600'}
                        placeholder="+53 485 594 4736"
                        {...register('telefono', {
                            required: 'El telefono es requerido'
                        })
                        }>
                    </Input>
                    {errors.telefono && <span className="text-red-500">{errors.telefono.message}</span>}
                </Field>
            </FieldGroup>

            <FieldGroup className="flex-row">
                <Field>
                    <Label>Contraseña</Label>
                    <Input
                        className={errors.contraseña && 'border-red-600'}
                        placeholder="Minimo debe incluir 8 caracteres"
                        type="password"
                        {...register('contraseña', {
                            required: 'La contraseña es obligatoria',
                            minLength: { value: 8, message: 'La contraseña debe tener minimo 8 caracteres' }
                        })
                        }>
                    </Input>
                    {errors.contraseña && <span className="text-red-500">{errors.contraseña.message}</span>}

                </Field>
                <Field>
                    <Label>Rol</Label>

                    <Controller
                        control={control}
                        name="rol"
                        rules={{ required: 'El rol es requerido' }}
                        render={({ field }) => (

                            <SelectComponent
                                title='Roles'
                                placeholder="Seleccione un rol"
                                data={roles}
                                onChange={field.onChange}
                                value={field.value}
                            />
                        )}
                    />
                    {errors.rol && <span className="text-red-500 text-sm">{errors.rol.message}</span>}

                </Field>
            </FieldGroup>
            <hr />
            {
                esPaciente && (
                    <>
                        <FieldGroup className="flex-row">
                            <Field>
                                <Label>Direccion</Label>
                                <Input
                                    className={errors.paciente?.direccion && 'border-red-600'}
                                    placeholder="ingrese su dirección"
                                    {...register('paciente.direccion', {
                                        required: 'La contraseña es obligatoria'
                                    })
                                    }>
                                </Input>
                                {errors.paciente?.direccion && <span className="text-red-500">{errors.paciente?.direccion.message}</span>}
                            </Field>
                            <Field>
                                <Label>Telefono de emergencia</Label>
                                <Input
                                    className={errors.paciente?.telefono_emergencia && 'border-red-600'}
                                    placeholder="+52 394 586 5848"
                                    {...register('paciente.telefono_emergencia', {
                                        required: 'El telefono de emergencia es obligatorio'
                                    })
                                    }>
                                </Input>
                                {errors.paciente?.telefono_emergencia && <span className="text-red-500">{errors.paciente?.telefono_emergencia.message}</span>}

                            </Field>
                        </FieldGroup>

                        <FieldGroup className="flex-row">
                            <Field>
                                <Label>Fecha de nacimiento</Label>
                                <Input
                                    className={errors.nombre && 'border-red-600'}
                                    type="date"
                                    {...register('paciente.fecha_nacimiento', {
                                        required: 'La fecha de nacimiento es obligatoria'
                                    })
                                    }>
                                </Input>
                                {errors.paciente?.fecha_nacimiento && <span className="text-red-500">{errors.paciente?.fecha_nacimiento.message}</span>}

                            </Field>
                        </FieldGroup>
                    </>
                )
            }

            <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Cargando...' : 'Crear usuario'}</Button>
            </div>
        </form>
    )
}