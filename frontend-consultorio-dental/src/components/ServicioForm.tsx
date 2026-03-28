import { useState } from 'react'
import { useServicios } from '../hooks/useServicios'
import type { RegistrarServicio } from '../types/RegistrarServicio'
import type { RespuestaServicio } from '../types/respuestas/RespuestaServicio'
import toast from 'react-hot-toast'

interface FormData {
    nombre: string
    precio: string
    horas: string
    minutos: string
    descripcion: string
}

const initialState: FormData = {
    nombre: '',
    precio: '',
    horas: '',
    minutos: '',
    descripcion: '',
}

interface Props {
    onSubmit?: (nuevoServicio: RespuestaServicio) => void
    onCancel?: () => void
}

export default function ServicioForm({ onSubmit, onCancel }: Props) {

    const [form, setForm] = useState<FormData>(initialState);
    const { crearServicio, error } = useServicios();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        !form.horas ? form.horas = '0' : form.horas ;
        !form.minutos ? form.minutos = '0' : form.minutos ;

        const sumaTotal = (Number(form.horas) * 60) + Number(form.minutos);

        if (sumaTotal > 120 || sumaTotal < 30) {
            toast.error('La cita solo puede durar un maximo de 2 horas y un minimo de 30 minutos');
            return;
        }

        const registrarServicio: RegistrarServicio = {
            nombre: form.nombre,
            duracion_horas: `${form.horas}:${form.minutos}`,
            precio: form.precio,
            descripcion: form.descripcion
        }

        const servicio = await crearServicio(registrarServicio);
        servicio && onSubmit?.(servicio);
    }

    return (
        <div className="form-card">
            
            {error && toast.error(error)}

            <form onSubmit={handleSubmit}>
                <div className="form-header">
                    <p className="form-title">Nuevo servicio</p>
                    <p className="form-subtitle">Completa los campos para registrar un nuevo servicio.</p>
                    <p className="form-subtitle" style={{fontWeight: '600', color: 'red'}}>La duración del servicio debe ser de un maximo de 2 horas y minimo de 30 minutos.</p>

                </div>

                <div className="form-section">
                    <p className="section-label">Información general</p>
                    <div className="form-grid">

                        <div className="field">
                            <label>Nombre</label>
                            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Blanqueamiento dental" />
                        </div>

                        <div className="field">
                            <label>Precio</label>
                            <input name="precio" type='number' value={form.precio} onChange={handleChange} placeholder="50.00" />
                        </div>

                        <div className="field">
                            <label>Horas</label>
                            <input name="horas" max='24' type='number' value={form.horas} onChange={handleChange} placeholder="1" />
                        </div>

                        <div className="field">
                            <label>Minutos</label>
                            <input name="minutos" max='59' type='number' value={form.minutos} onChange={handleChange} placeholder="30" />
                        </div>
                    </div>


                    <div className='form-secction' style={{ marginTop: '30px' }}>
                        <p className="section-label">Descripción del servicio</p>

                        <div className="field">
                            <label>Descripción</label>
                            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} id="descripcion" placeholder='Descripción breve'>
                            </textarea>
                        </div>
                    </div>

                </div>

                <div className="form-footer">
                    <button className="btn-cancel" type="button" onClick={onCancel}>Cancelar</button>
                    <button className="btn-registrar" type="submit" >Guardar usuario</button>
                </div>

            </form>

        </div>
    )
}