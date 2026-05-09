import { Button } from '../ui/button'
import { FieldGroup } from '../ui/field';
import { InputForm } from '../common/input.component';
import { useMemo } from 'react';
import { SelectForm } from '../common/input.component';
import type { Service } from '@/types/models/service';
import type { Patient } from '@/types/models/patient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
    type CreateAppointmentInput, 
    type CreateAppointmentOutput, 
    CreateAppointmentSchema 
} from './appointment.schema';
import type { CreateAppointmentDto } from '@/types/api/request/create-appointment.dto';

interface CreateAppointmentFormProps {
    onSubmit: (dto: CreateAppointmentDto) => void;
    onCancel: () => void;
    services: Service[];
    patients: Patient[];
}


export function CreateAppointmentForm({ onSubmit, onCancel, patients, services }: CreateAppointmentFormProps) {

    /**
     * Definimos el esquema
     */
    const {
        register,
        handleSubmit,
        control,
        formState: {
            isSubmitting,
            errors
        } } = useForm<CreateAppointmentInput, any, CreateAppointmentOutput>({
            resolver: zodResolver(CreateAppointmentSchema)
        });

    /**
     * INDICACIÓN:
     * No es necesario especificar el tipo ya que 
     * CreateAppointmentOutput es exactamente igual 
     * a CreateAppointmentDto
     */
    const handleSubmitForm = (data: CreateAppointmentOutput) => {

        onSubmit(data);
    }

    /**
     * INDICACIÓN:
     * Definimos los arrays de datos para los select
     */

    const servicesSelectData = useMemo(() => services.map(ser => ({ 
        value: ser.id, 
        data: ser.name 
    })), [services]);
    
    const patientsSelectData = useMemo(() => patients.map(pa => ({ 
        value: pa.id, 
        data: `${pa.name} ${pa.lastname}` 
    })), [patients]);


    return (
        <form className='flex flex-col gap-5' onSubmit={handleSubmit(handleSubmitForm)}>
            <FieldGroup className='flex-row'>

                <Controller control={control} name="service_id"
                    render={({ field }) => (
                        <SelectForm 
                            label="Servicio" 
                            title="Servicios" 
                            onChange={field.onChange}
                            value={field.value}
                            DATA={servicesSelectData}
                            placeholder={ !servicesSelectData.length ? 'No hay servicios' : 'Seleccione un servicio' }
                            error={errors.service_id?.message}
                        />
                    )}
                />

                <Controller control={control} name="patient_id"
                    render={({ field }) => (
                        <SelectForm 
                            label="Paciete" 
                            title="Pacientes" 
                            onChange={field.onChange}
                            DATA={patientsSelectData}
                            value={field.value}
                            placeholder={ !patientsSelectData.length ? 'No hay pacientes' : 'Seleccione un paciente' }
                            error={errors.patient_id?.message}
                        />
                    )}
                />

            </FieldGroup>

            <FieldGroup className='flex-row'>
                <InputForm
                    label='Fecha de la cita'
                    placeholder='Porfavor escoja una fecha para la cita'
                    type='date'
                    registration={register('date')}
                    error={errors.date?.message}
                />

                <InputForm
                    label='Hora de la cita'
                    placeholder='Porfavor escoja una hora para la cita'
                    type='time'
                    registration={register('time')}
                    error={errors.time?.message}
                />
            </FieldGroup>

            <FieldGroup>
                <InputForm
                    label='Notas'
                    placeholder='Por favor escriba una nota previa para la cita'
                    registration={register('notes')}
                    error={errors.notes?.message}
                />
            </FieldGroup>

            <FieldGroup className='flex-row justify-end gap-2'>
                <Button
                    variant="secondary"
                    type='button'
                    onClick={() => onCancel()}>
                    Cancelar
                </Button>
                <Button
                    disabled={isSubmitting}
                    variant="primary">
                    {isSubmitting ? 'Cargando...' : 'Agendar cita'}
                </Button>
            </FieldGroup>
        </form>
    )
}