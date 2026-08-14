import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateServiceSchema } from "@/features/services/components/service.schema";
import type { ServiceInputData, ServiceOutputData } from "@/features/services/components/service.schema";
import { FieldGroup } from "@/components/ui/field"
import { InputForm, TextareaForm } from "@/components/shared/input.component"
import { Button } from '@/components/ui/button'
import type { CreateServiceDto } from '@/features/services/types/create-service.dto';
import { Spinner } from "@/components/ui/spinner";
import { useCreateService } from "../hooks/use-services";
import toast from "react-hot-toast";


interface CreateServiceFormProps {
    onSubmit: () => void
    onCancel: () => void;
}

export function CreateServiceForm({ onSubmit, onCancel }: CreateServiceFormProps) {

    const createService = useCreateService();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ServiceInputData, any, ServiceOutputData>({
        resolver: zodResolver(CreateServiceSchema),
        mode: 'onChange'
    })

    const handleFormSubmit = async (data: ServiceOutputData) => {

        const totalDuration = (data.duration_hours * 60) + (data.duration_minutes ?? 0);

        const createServiceDto: CreateServiceDto = {
            name: data.name,
            price: data.price,
            durationMinutes: totalDuration,
            description: data.description
        }

        createService.mutate(createServiceDto, {
            onSuccess: () => {
                onSubmit();
                toast.success('Servicio registrado exitosamente')
            },
            onError: (error) => toast.error(error.message)
        });
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-7'>

            <FieldGroup className='flex-row'>

                <InputForm label="Nombre" placeholder="Ingresa tu nombre"
                    registration={register('name')}
                    error={errors.name?.message}
                />

                <InputForm label="Precio" type='number' step='0.01' placeholder="0.00"
                    registration={register('price')}
                    error={errors.price?.message}
                />

            </FieldGroup>
            <FieldGroup className='flex-row'>

                <InputForm label="Duracion en horas" type='number' placeholder="El servicio debe durar un maximo de 2 horas"
                    registration={register('duration_hours')}
                    error={errors.duration_hours?.message}
                />

                <InputForm label="Duración en minutos" type='number' placeholder="Debe durar un minimo de 30 minutos"
                    registration={register('duration_minutes')}
                    error={errors.duration_minutes?.message}
                />

            </FieldGroup>
            <FieldGroup className='flex-row'>

                <TextareaForm 
                    label="Descripción" 
                    placeholder="Ingresa una descripción del servicio"
                    registration={register('description')}
                    error={errors.description?.message}
                />

            </FieldGroup>
            <FieldGroup>

                <InputForm
                    label="Imagenes"
                    placeholder="Selecciona algunas imagenes ilustrativas del servicio"
                />

            </FieldGroup>

            <FieldGroup className="flex flex-row justify-end gap-2 mt-2">
                <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
                <Button variant="primary" type="submit" disabled={createService.isPending}>
                    {createService.isPending && <Spinner /> } Registrar servicio
                </Button>
            </FieldGroup>
        </form>
    )
}
