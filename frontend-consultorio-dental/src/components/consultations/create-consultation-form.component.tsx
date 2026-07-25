import { FieldGroup } from '../ui/field';
import { InputForm } from '../common/input.component';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateConsultationDto } from '@/types/api/request/create-consultation.dto';

import {
    type CreateConsultationInput,
    type CreateConsultationOutput,
    CreateConsultationSchema
} from './consultation.schema';

/**
 * INDICACIÓN:
 * Este id conecta el formulario con el boton de "Guardar consulta"
 * que vive en el footer del modal (fuera del <form>), a traves del
 * atributo HTML `form`. Mismo patron que UpdateAppointmentForm.
 */
export const CREATE_CONSULTATION_FORM_ID = 'create-consultation-form';

interface CreateConsultationFormProps {
    appointmentId: number;
    onSubmit: (dto: CreateConsultationDto) => void;
}

export function CreateConsultationForm({ appointmentId, onSubmit }: CreateConsultationFormProps) {

    const {
        register,
        handleSubmit,
        formState: {
            errors
        } } = useForm<CreateConsultationInput, any, CreateConsultationOutput>({
            resolver: zodResolver(CreateConsultationSchema)
        });

    const handleSubmitForm = (data: CreateConsultationOutput) => {

        const dto: CreateConsultationDto = {
            notes: data.notes,
            observations: data.observations,
            appointment_id: appointmentId,
        }

        onSubmit(dto);
    }

    return (
        <form id={CREATE_CONSULTATION_FORM_ID} className='flex flex-col gap-5' onSubmit={handleSubmit(handleSubmitForm)}>
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
