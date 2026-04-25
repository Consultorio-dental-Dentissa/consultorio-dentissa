import { useForm } from "react-hook-form"
import toast from 'react-hot-toast'

import { FieldGroup } from "@/components/ui/field"
import { InputForm } from "@/components/common/input.component"
import { Button } from '../ui/button'

import type { CreateServiceDto } from '../../types/api/request/create-service.dto'

interface CreateServiceFormProps {
    onSubmit: (nuevoServicio: CreateServiceDto) => Promise<void>
    onCancel: () => void
}

interface CreateServiceFormData {
    name: string;
    price: number;
    duration_hours: number;
    duration_minutes: number;
    description: string;
}

export function CreateServiceForm({ onSubmit, onCancel }: CreateServiceFormProps) {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateServiceFormData>()

    const handleFormSubmit = async (data: CreateServiceFormData) => {
        
        const totalDuration = (data.duration_hours * 60) + data.duration_minutes;

        if (totalDuration > 120) {
            toast.error('La duración total debe ser maximo de 2 horas');
            return;
        }

        const newService: CreateServiceDto = {
            name: data.name,
            price: data.price,
            durationMinutes: totalDuration,
            description: data.description
        }

        await onSubmit(newService);
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-7'>

            <FieldGroup className='flex-row'>

                <InputForm
                    label="Nombre"
                    placeholder="Ingresa tu nombre"
                    registration={register('name', {
                        required: 'El nombre es obligatorio',
                    })
                    }
                    error={errors.name?.message}
                />

                <InputForm
                    label="Precio"
                    type='number'
                    step='0.01'
                    placeholder="0.00"
                    registration={register('price', {
                        required: 'El precio es obligatorio',
                        min: { value: 0, message: 'El precio debe ser mayor a cero' },
                        valueAsNumber: true,
                    })
                    }
                    error={errors.price?.message}
                />

            </FieldGroup>
            <FieldGroup className='flex-row'>

                <InputForm
                    label="Duracion en horas"
                    placeholder="El servicio debe durar un maximo de 2 horas"
                    registration={register('duration_hours', {
                            required: 'La duracion en horas es obligatoria (ingresa cero en caso de no querer disponer de mas de 1 hora de duración)',
                            min: { value: 0, message: 'Las horas no deben ser menos de cero' },
                            max: { value: 2, message: 'ELas horas no pueden ser mas de 2' },
                            valueAsNumber: true,
                        })
                    }
                    error={errors.duration_hours?.message}
                />

                <InputForm
                    label="Duración en minutos"
                    placeholder="Debe durar un minimo de 30 minutos"
                    registration={register('duration_minutes', {
                            required: 'La duracion en minutos es obligatoria (ingresa cero en caso de no querer ingresar minutos fijos)',
                            min: { value: 0, message: 'Los minutos no deben ser menos de cero' },
                            valueAsNumber: true,
                        })
                    }
                    error={errors.duration_minutes?.message}
                />

            </FieldGroup>

            <FieldGroup className='flex-row'>

                <InputForm
                    label="Descripción"
                    placeholder="Ingresa una descripción del servicio"
                    registration={register('description', {
                            required: 'La descripción es obligatoria',
                            maxLength: {value: 255, message: 'La descripción debe contener maximo 500 caracteres'}
                        })
                    }
                    error={errors.description?.message}
                />

            </FieldGroup>

            <FieldGroup>

                <InputForm
                    label="Imagenes"
                    placeholder="Selecciona algunas imagenes ilustrativas del servicio"
                />

            </FieldGroup>

            <div className="flex justify-end gap-2 mt-2">
                <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>Guardar servicio</Button>
            </div>

        </form>
    )
}
