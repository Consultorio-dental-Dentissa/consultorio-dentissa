import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field';
import { InputForm, TextareaForm } from '@/components/shared/input.component';
import { useMemo } from 'react';
import { SelectForm } from '@/components/shared/input.component';
import { useServices } from "@/features/services/hooks/use-services";
import { usePatients } from "@/features/patients/hooks/use-patients";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@/components/ui/spinner';
import { type CreateAppointmentDto } from '@/features/appointments/types/create-appointment.dto';
import { type CreateAppointmentInput, type CreateAppointmentOutput, CreateAppointmentSchema } from '@/features/appointments/components/appointment.schema';
import { useCreateAppointment } from '../hooks/use-appointments';
import toast from 'react-hot-toast';


interface CreateAppointmentFormProps {
    onSubmit: () => void;
    onCancel: () => void;
}


export function CreateAppointmentForm({ onSubmit, onCancel }: CreateAppointmentFormProps) {


    const patients = usePatients();
    const services = useServices();
    const createAppointmentMutation = useCreateAppointment();

    // Definimos el esquema
    const {
        register,
        handleSubmit,
        control,
        formState: { errors } } = useForm<CreateAppointmentInput, any, CreateAppointmentOutput>({
            resolver: zodResolver(CreateAppointmentSchema),
            mode: 'onChange'
        });

    /**
     * INDICACIÓN:
     * No es necesario especificar el tipo ya que 
     * CreateAppointmentOutput es exactamente igual 
     * a CreateAppointmentDto
     */
    const handleSubmitForm = (data: CreateAppointmentOutput) => {

        const dto: CreateAppointmentDto = {
            /**
             * INDICACIÓN: 
             * Construimos la fecha en formato UTC usando 
             * los datos de los inputs de date y time 
             */
            scheduled_at: new Date(`${data.date}T${data.time}:00`).toISOString(),
            patient_id: data.patient_id,
            service_id: data.service_id,
            notes: data.notes
        }

        createAppointmentMutation.mutate(dto, {
            onSuccess: () => {
                onSubmit();
                toast.success('Cita agendada correctamente');
            },
            onError: (error) => toast.error(error.message)
        })
    }

    // Arrays de datos para los selects
    const servicesSelectData = useMemo(() => services.data ? services.data?.filter(s => s.status).map(service => ({ value: service.id, data: service.name })) : [], [services.data]);
    
    const patientsSelectData = useMemo(() => patients.data ? patients.data?.filter(s => s.status).map(patient => ({ value: patient.id, data: `${patient.name} ${patient.lastname}` })) : [], [patients.data]);


    return (
        <form className='flex flex-col gap-5 max-w-full' onSubmit={handleSubmit(handleSubmitForm)}>
            <FieldGroup className='flex-row'>

                <Controller control={control} name="service_id"
                    render={({ field }) => (
                        <SelectForm 
                            label="Servicio"
                            title="Servicios" 
                            onChange={field.onChange}
                            value={field.value}
                            DATA={servicesSelectData}
                            placeholder={servicesSelectData.length ? 'Seleccione un servicio' : 'No hay servicios' }
                            error={errors.service_id?.message}
                        />
                    )}
                />

                <Controller control={control} name="patient_id"
                    render={({ field }) => (
                        <SelectForm 
                            label="Paciente" 
                            title="Pacientes" 
                            onChange={field.onChange}
                            DATA={patientsSelectData}
                            value={field.value}
                            placeholder={patientsSelectData.length ? 'Seleccione un paciente' : 'No hay pacientes'}
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
                <TextareaForm
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
                
                <Button variant="primary" type="submit" disabled={createAppointmentMutation.isPending}>
                    {createAppointmentMutation.isPending ? <Spinner />  : 'Agendar cita'}
                </Button>

            </FieldGroup>
        </form>
    )
}