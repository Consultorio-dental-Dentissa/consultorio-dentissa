import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { RespuestaServicio } from '../types/api/responses/RespuestaServicio'
import type { RespuestaPaciente } from '../types/api/responses/RespuestaPaciente'
import { usePacientes } from '../hooks/usePacientes'
import { useServicios } from '../hooks/useServicios'
import { useCitas } from '../hooks/useCitas'
import type { CrearCita } from '../types/api/request/CrearCita'
import type { RespuestaCita } from '../types/api/responses/RespuestaCita'

interface FormData {
    fecha: string
    hora: string
    notaPrevia: string
    servicio: string
    paciente: string
}

const initialState: FormData = {
    fecha: '',
    hora: '',
    notaPrevia: '',
    servicio: '',
    paciente: '',
}

interface Props {
    onSubmit: (nuevaCita: RespuestaCita) => void
    onCancel?: () => void
}

export default function CitaForm({ onSubmit, onCancel }: Props) {

    const [form, setForm] = useState<FormData>(initialState);

    const [servicios, setServicios] = useState<RespuestaServicio[]>([]);
    const [pacientes, setPacientes] = useState<RespuestaPaciente[]>([]);

    const { crearCita, cargando, error } = useCitas();
    const { obtenerServicios } = useServicios();
    const { obtenerPacientes } = usePacientes();

    const hoy = new Date();
    const fechaLocal = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
    ).toISOString().split('T')[0];

    useEffect(() => {

        async function cargarDatos() {

            try {
                const respuestaServicios = await obtenerServicios();
                const respuestaPacientes = await obtenerPacientes();

                setServicios(respuestaServicios);
                setPacientes(respuestaPacientes);
            } catch(error) {
                toast.error((error as string))
            }
        }

        cargarDatos();

    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        Object.values(form).some(campo => !campo) && toast.error('Debes llenar todos los campos');
        console.log(form);

        if (form.fecha < fechaLocal) {
            toast.error('No puedes seleccionar una fecha pasada');
            return;
        }

        const registrarCita: CrearCita = {
            fecha: form.fecha,
            hora: form.hora,
            nota_previa: form.notaPrevia,
            paciente_id: Number(form.paciente),
            servicio_id: Number(form.servicio)
        }

        try {
            const cita = await crearCita(registrarCita);
            toast.success('La cita se ha agendado exitosamente');
            onSubmit(cita);
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
                            <input name="fecha" type='date' value={form.fecha} onChange={handleChange} placeholder="Seleccione la fecha en la que quiera realizar su cita" />
                        </div>

                        <div className="field">
                            <label>Hora</label>
                            <input name="hora" type='time' value={form.hora} onChange={handleChange} placeholder="Seleccione la hora" />
                        </div>

                        <div className="field">
                            <label>Servicio</label>
                            <select name="servicio" id="servicio" value={form.servicio} onChange={handleChange}>
                                {
                                    servicios.map((servicio) => {

                                        return (
                                            <option value={servicio.id}>
                                                {servicio.nombre}
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
                                    pacientes.map((paciente) => {
                                        return (
                                            <option value={paciente.id}>{paciente.usuario.nombre} {paciente.usuario.apellido} | {paciente.usuario.correo}</option>
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
                            <textarea name="notaPrevia" value={form.notaPrevia} onChange={handleChange} id="notaPrevia" placeholder='Porfavor escriba porque quiere realizar su cita'>
                            </textarea>
                        </div>
                    </div>

                </div>

                <div className="form-footer">
                    <button className="btn-cancel" type="button" onClick={onCancel}>Cancelar</button>
                    <button className="btn-registrar" type="submit" disabled={cargando}>Agendar cita</button>
                </div>

            </form>

        </div>
    )
}