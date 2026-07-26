import { Button } from '../ui/button'
import { Field } from '../ui/field';
import { InputForm } from '../common/input.component';
import type { Tooth } from '@/types/models/tooth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { TOOTH_STATUS_OPTIONS } from './tooth-status.config';
import type { UpdateToothDto } from '@/types/api/request/update-tooth.dto';

import {
    type UpdateToothInput,
    type UpdateToothOutput,
    UpdateToothSchema
} from './tooth.schema';

/**
 * INDICACIÓN:
 * Este id conecta el formulario con el boton de "Guardar cambios"
 * que vive en el footer del modal (fuera del <form>), a traves del
 * atributo HTML `form`.
 */
export const UPDATE_TOOTH_FORM_ID = 'update-tooth-form';

interface UpdateToothFormProps {
    tooth: Tooth;
    onSubmit: (dto: UpdateToothDto) => void;
}

export function UpdateToothForm({ tooth, onSubmit }: UpdateToothFormProps) {

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {
            errors
        } } = useForm<UpdateToothInput, any, UpdateToothOutput>({
            resolver: zodResolver(UpdateToothSchema),
            defaultValues: {
                status: tooth.status,
                note: tooth.note ?? '',
            }
        });

    const selectedStatus = watch('status');

    const handleSubmitForm = (data: UpdateToothOutput) => {
        onSubmit(data);
    }

    return (
        <form id={UPDATE_TOOTH_FORM_ID} className='flex flex-col gap-5' onSubmit={handleSubmit(handleSubmitForm)}>
            <Field>
                <label className="text-sm font-medium leading-none">Estatus del diente</label>

                <div className="flex flex-row flex-wrap gap-2">
                    {TOOTH_STATUS_OPTIONS.map(option => (
                        <Button
                            key={option.value}
                            type="button"
                            variant={selectedStatus === option.value ? 'outline' : 'secondary'}
                            className={cn(selectedStatus === option.value && `border-2 ${option.color} hover:${option.color}`)}
                            onClick={() => setValue('status', option.value, { shouldValidate: true, shouldDirty: true })}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>

                {errors.status?.message && (
                    <span className="text-red-500 text-sm">{errors.status.message}</span>
                )}
            </Field>

            <InputForm
                label='Nota'
                placeholder='Escriba una nota sobre el estado de este diente'
                isTextarea
                registration={register('note')}
                error={errors.note?.message}
            />
        </form>
    )
}
