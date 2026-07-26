import { Button } from '../ui/button'
import { FieldGroup, Field } from '../ui/field';
import { InputForm, SelectForm } from '../common/input.component';
import { useMemo } from 'react';
import type { Service } from '@/types/models/service';
import type { Patient } from '@/types/models/patient';
import type { Appointment } from '@/types/models/appointment';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { StatusAppointment } from '@/types/enums/status-appointment.enum';
import { toLocalDateString } from '@/utils/formatters';
import type { UpdateAppointmentDto } from '@/types/api/request/update-appointment.dto';

import {
    type UpdateAppointmentInput,
    type UpdateAppointmentOutput,
    UpdateAppointmentSchema
} from './appointment.schema';

/**
 * INDICACIÓN:
 * Este id conecta el formulario con el boton de "Modificar cita"
 * que vive en el footer del modal (fuera del <form>), a traves del
 * atributo HTML `form`. Es la forma nativa de enviar un formulario
 * desde un boton que no es descendiente de el.
 */
export const UPDATE_APPOINTMENT_FORM_ID = 'update-appointment-form';

interface UpdateAppointmentFormProps {
    appointment: Appointment;
    onSubmit: (dto: UpdateAppointmentDto) => void;
    services: Service[];
    patients: Patient[];
}

const STATUS_OPTIONS: { value: StatusAppointment; label: string; color: string }[] = [
    { value: StatusAppointment.PENDIENTE, label: 'Pendiente', color: 'bg-gray-400' },
    { value: StatusAppointment.CONFIRMADA, label: 'Confirmada', color: 'bg-green-400' },
    { value: StatusAppointment.COMPLETADA, label: 'Completada', color: 'bg-blue-400' },
    { value: StatusAppointment.CANCELADA, label: 'Cancelada', color: 'bg-red-400' },
    { value: StatusAppointment.REPROGRAMADA, label: 'Reprogramada', color: 'bg-orange-400' },
];

const STATUSES_THAT_REQUIRE_REASON: StatusAppointment[] = [
    StatusAppointment.CANCELADA,
    StatusAppointment.REPROGRAMADA,
];

export function UpdateAppointmentForm({ appointment, onSubmit, patients, services }: UpdateAppointmentFormProps) {

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: {
            errors
        } } = useForm<UpdateAppointmentInput, any, UpdateAppointmentOutput>({
            resolver: zodResolver(UpdateAppointmentSchema),
            defaultValues: {
                service_id: String(appointment.service_id),
                patient_id: String(appointment.patient_id),
                date: toLocalDateString(appointment.scheduled_at),
                time: appointment.scheduled_at.toTimeString().slice(0, 5),
                notes: appointment.notes,
                status: appointment.status,
                reason: '',
            }
        });

    const selectedStatus = watch('status');
    const showReasonInput = STATUSES_THAT_REQUIRE_REASON.includes(selectedStatus);

    /**
     * INDICACIÓN:
     * No es necesario especificar el tipo ya que
     * UpdateAppointmentOutput es exactamente igual
     * a UpdateAppointmentDto
     */
    const handleSubmitForm = (data: UpdateAppointmentOutput) => {

        const dto: UpdateAppointmentDto = {
            /**
             * INDICACIÓN:
             * Construimos la fecha en formato UTC usando
             * los datos de los inputs de date y time
             */
            scheduled_at: new Date(`${data.date}T${data.time}:00`).toISOString(),
            patient_id: data.patient_id,
            service_id: data.service_id,
            notes: data.notes,
            status: data.status,
            reason: data.reason,
        }

        onSubmit(dto);
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
        <form id={UPDATE_APPOINTMENT_FORM_ID} className='flex flex-col gap-5' onSubmit={handleSubmit(handleSubmitForm)}>
            <FieldGroup className='flex-row'>

                <Controller control={control} name="service_id"
                    render={({ field }) => (
                        <SelectForm
                            label="Servicio"
                            title="Servicios"
                            onChange={field.onChange}
                            value={field.value}
                            DATA={servicesSelectData}
                            placeholder={!servicesSelectData.length ? 'No hay servicios' : 'Seleccione un servicio'}
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
                            placeholder={!patientsSelectData.length ? 'No hay pacientes' : 'Seleccione un paciente'}
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

            <Field>
                <label className="text-sm font-medium leading-none">Estatus de la cita</label>

                <div className="flex flex-row flex-wrap gap-2">
                    {STATUS_OPTIONS.map(option => (
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

            {showReasonInput && (
                <FieldGroup>
                    <InputForm
                        label='Motivo'
                        placeholder='Escriba el motivo de la cancelación o reprogramación'
                        registration={register('reason')}
                        error={errors.reason?.message}
                    />
                </FieldGroup>
            )}
        </form>
    )
}
