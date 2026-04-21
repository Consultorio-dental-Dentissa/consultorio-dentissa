import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { ServiceResponse } from '../../types/api/responses/service.response'
import type { PatientResponse } from '../../types/api/responses/patient.response'
import { usePatients } from '../../hooks/use-patients'
import { useServices } from '../../hooks/use-services'
import { useAppointments } from '../../hooks/use-appointments'
import type { CreateAppointmentDto } from '../../types/api/request/create-appointment.dto'
import type { AppointmentResponse } from '../../types/api/responses/appointment.response'

interface FormData {
    date: string
    time: string
    notes: string
    service: string
    patient: string
}

const initialState: FormData = {
    date: '',
    time: '',
    notes: '',
    service: '',
    patient: '',
}

interface CreateAppointmentFormProps {
    onSubmit: (newAppointment: AppointmentResponse) => void
    onCancel?: () => void
}

export default function CreateAppointmentForm({ onSubmit, onCancel }: CreateAppointmentFormProps) {

    const [form, setForm] = useState<FormData>(initialState);

    const [services, setServices] = useState<ServiceResponse[]>([]);
    const [patients, setPatients] = useState<PatientResponse[]>([]);

    const { createAppointment, loading, error } = useAppointments();
    const { getServices } = useServices();
    const { getPatients } = usePatients();

    const today = new Date();
    const localDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    ).toISOString().split('T')[0];

    useEffect(() => {

        async function fetchData() {

            try {
                const services = await getServices();
                const patients = await getPatients();

                setServices(services);
                setPatients(patients);
            } catch(error) {
                toast.error((error as string))
            }
        }

        fetchData();

    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        Object.values(form).some(field => !field) && toast.error('Debes llenar todos los campos');
        console.log(form);

        if (form.date < localDate) {
            toast.error('No puedes seleccionar una fecha pasada');
            return;
        }

        const appointment: CreateAppointmentDto = {
            date: form.date,
            time: form.time,
            notes: form.notes,
            patient_id: Number(form.patient),
            service_id: Number(form.service)
        }

        try {
            const newAppointment = await createAppointment(appointment);
            toast.success('La cita se ha agendado exitosamente');
            onSubmit(newAppointment);
        } catch (error) {
            toast.error((error as string));
        }
    }

    console.log(form);

    return (
        <div className="form-card">

            {error && toast.error(error)}

            <form onSubmit={handleSubmit}>
                <div className="form-header">
                    <p className="form-title">Agendar cita</p>
                    <p className="form-subtitle">Completa los campos para agendar una nueva cita.</p>
                </div>

                <div className="form-section">
                    <p className="section-label">Información general</p>
                    <div className="form-grid">

                        <div className="field">
                            <label>Fecha de la cita</label>
                            <input name="fecha" type='date' value={form.date} onChange={handleChange} placeholder="Seleccione la fecha en la que quiera realizar su cita" />
                        </div>

                        <div className="field">
                            <label>Hora</label>
                            <input name="hora" type='time' value={form.time} onChange={handleChange} placeholder="Seleccione la hora" />
                        </div>

                        <div className="field">
                            <label>Servicio</label>
                            <select name="servicio" id="servicio" value={form.service} onChange={handleChange}>
                                {
                                    services.map((servicio) => {

                                        return (
                                            <option value={servicio.id}>
                                                {servicio.name}
                                            </option>
                                        )
                                    })
                                }
                            </select>
                        </div>

                        <div className="field">
                            <label>Paciente</label>
                            <select name="paciente" id="paciente" onChange={handleChange}>
                                {
                                    patients.map((paciente) => {
                                        return (
                                            <option value={paciente.id}>{paciente.user.name} {paciente.user.lastname} | {paciente.user.email}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                    </div>


                    <div className='form-secction' style={{ marginTop: '30px' }}>
                        <p className="section-label">Nota previa</p>

                        <div className="field">
                            <label>Descripción</label>
                            <textarea name="notaPrevia" value={form.notes} onChange={handleChange} id="notaPrevia" placeholder='Porfavor escriba porque quiere realizar su cita'>
                            </textarea>
                        </div>
                    </div>

                </div>

                <div className="form-footer">
                    <button className="btn-cancel" type="button" onClick={onCancel}>Cancelar</button>
                    <button className="btn-registrar" type="submit" disabled={loading}>Agendar cita</button>
                </div>

            </form>

        </div>
    )
}