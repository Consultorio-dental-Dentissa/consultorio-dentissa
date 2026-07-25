import { FieldGroup } from '../ui/field';
import { InputForm } from '../common/input.component';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Consultation } from '@/types/models/consultation';
import type { UpdateConsultationDto } from '@/types/api/request/update-consultation.dto';

import {
    type UpdateConsultationInput,
    type UpdateConsultationOutput,
    UpdateConsultationSchema
} from './consultation.schema';

/**
 * INDICACIÓN:
 * Este id conecta el formulario con el boton de "Guardar cambios"
 * que vive en el footer del modal (fuera del <form>), a traves del
 * atributo HTML `form`. Mismo patron que CreateConsultationForm/UpdateAppointmentForm.
 */
export const UPDATE_CONSULTATION_FORM_ID = 'update-consultation-form';

interface UpdateConsultationFormProps {
    consultation: Consultation;
    onSubmit: (dto: UpdateConsultationDto) => void;
}

export function UpdateConsultationForm({ consultation, onSubmit }: UpdateConsultationFormProps) {

    const {
        register,
        handleSubmit,
        formState: {
            errors
        } } = useForm<UpdateConsultationInput, any, UpdateConsultationOutput>({
            resolver: zodResolver(UpdateConsultationSchema),
            defaultValues: {
                notes: consultation.notes,
                observations: consultation.observations,
            }
        });

    const handleSubmitForm = (data: UpdateConsultationOutput) => {

        const dto: UpdateConsultationDto = {
            notes: data.notes,
            observations: data.observations,
        }

        onSubmit(dto);
    }

    return (
        <form id={UPDATE_CONSULTATION_FORM_ID} className='flex flex-col gap-5' onSubmit={handleSubmit(handleSubmitForm)}>
            <FieldGroup>
                <InputForm
                    label='Notas'
                    placeholder='Describe lo que se realizó durante la consulta'
                    registration={register('notes')}
                    error={errors.notes?.message}
                    isTextarea={true}
                />
            </FieldGroup>

            <FieldGroup>
                <InputForm
                    label='Observaciones'
                    placeholder='Escribe alguna información relevante sobre la consulta'
                    registration={register('observations')}
                    error={errors.observations?.message}
                    isTextarea={true}
                />
            </FieldGroup>
        </form>
    )
}
