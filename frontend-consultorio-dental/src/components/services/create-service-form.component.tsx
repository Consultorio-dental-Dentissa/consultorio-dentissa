import type { CreateServiceDto } from '../../types/api/request/create-service.dto'
import { FieldGroup } from "@/components/ui/field"
import { InputForm } from "@/components/common/input.component"
import { PrimaryButton, SecondaryButton } from "../common/button.component"
import { useForm } from "react-hook-form"
import toast from 'react-hot-toast'

interface CreateServiceFormProps {
    onSubmit: (nuevoServicio: CreateServiceDto) => Promise<void>
    onCancel: () => void
}

interface CrearServicioFormData {
    nombre: string;
    precio: number;
    duracion_horas: number;
    duracion_minutos: number;
    descripcion: string;
}

export function CreateServiceForm({ onSubmit, onCancel }: CreateServiceFormProps) {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CrearServicioFormData>()

    const manejarSubmit = async (data: CrearServicioFormData) => {
        
        const duracionTotal = (data.duracion_horas * 60) + data.duracion_minutos;

        if (duracionTotal > 120) {
            toast.error('La duración total debe ser maximo de 2 horas');
            return;
        }

        const nuevoServicio: CreateServiceDto = {
            name: data.nombre,
            price: data.precio,
            durationMinutes: duracionTotal,
            description: data.descripcion
        }

        await onSubmit(nuevoServicio);
    }

    return (
        <form onSubmit={handleSubmit(manejarSubmit)} className='flex flex-col gap-7'>

            <FieldGroup className='flex-row'>

                <InputForm
                    label="Nombre"
                    placeholder="Ingresa tu nombre"
                    registration={register('nombre', {
                        required: 'El nombre es obligatorio',
                    })
                    }
                    error={errors.nombre?.message}
                />

                <InputForm
                    label="Precio"
                    type='number'
                    step='0.01'
                    placeholder="0.00"
                    registration={register('precio', {
                        required: 'El precio es obligatorio',
                        min: { value: 0, message: 'El precio debe ser mayor a cero' },
                        valueAsNumber: true,
                    })
                    }
                    error={errors.precio?.message}
                />

            </FieldGroup>
            <FieldGroup className='flex-row'>

                <InputForm
                    label="Duracion en horas"
                    placeholder="El servicio debe durar un maximo de 2 horas"
                    registration={register('duracion_horas', {
                            required: 'La duracion en horas es obligatoria (ingresa cero en caso de no querer disponer de mas de 1 hora de duración)',
                            min: { value: 0, message: 'Las horas no deben ser menos de cero' },
                            max: { value: 2, message: 'ELas horas no pueden ser mas de 2' },
                            valueAsNumber: true,
                        })
                    }
                    error={errors.duracion_horas?.message}
                />

                <InputForm
                    label="Duración en minutos"
                    placeholder="Debe durar un minimo de 30 minutos"
                    registration={register('duracion_minutos', {
                            required: 'La duracion en minutos es obligatoria (ingresa cero en caso de no querer ingresar minutos fijos)',
                            min: { value: 0, message: 'Los minutos no deben ser menos de cero' },
                            valueAsNumber: true,
                        })
                    }
                    error={errors.duracion_minutos?.message}
                />

            </FieldGroup>

            <FieldGroup className='flex-row'>

                <InputForm
                    label="Descripción"
                    placeholder="Ingresa una descripción del servicio"
                    registration={register('descripcion', {
                            required: 'La descripción es obligatoria',
                            maxLength: {value: 255, message: 'La descripción debe contener maximo 500 caracteres'}
                        })
                    }
                    error={errors.descripcion?.message}
                />

            </FieldGroup>

            <FieldGroup>

                <InputForm
                    label="Imagenes"
                    placeholder="Selecciona algunas imagenes ilustrativas del servicio"
                />

            </FieldGroup>

            <div className="flex justify-end gap-2 mt-2">
                <SecondaryButton message="Cancelar" onClick={onCancel} type="button" />
                <PrimaryButton
                    message={isSubmitting ? "Cargando..." : "Crear servicio"}
                    disabled={isSubmitting}
                    type="submit"
                />
            </div>

        </form>
    )
}
