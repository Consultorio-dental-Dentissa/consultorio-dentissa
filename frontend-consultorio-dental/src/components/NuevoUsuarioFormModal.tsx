import { useState } from 'react'
import type { RegistrarUsuario } from '../types/RegistrarUsuario'
import { requestRegistrarUsuario } from '../services/usuarios.service'
import toast from 'react-hot-toast';
import type { ApiError } from '../types/respuestas/ApiError';
import type { Usuario } from '../types/Usuario';


interface FormData {
    nombre: string
    apellido: string
    telefono: string
    correo: string
    contraseña: string
    rol: string
    direccion: string
    telefonoEmergencia: string
    fechaNacimiento: string
}

const initialState: FormData = {
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    contraseña: '',
    rol: '',
    direccion: '',
    telefonoEmergencia: '',
    fechaNacimiento: '',
}

interface Props {
    onSubmit?: (nuevoUsuario: Usuario) => void
    onCancel?: () => void
}

export default function NuevoUsuarioForm({ onSubmit, onCancel }: Props) {

    const [form, setForm] = useState<FormData>(initialState)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        const datos_usuario: RegistrarUsuario = {
            nombre: form.nombre,
            apellido: form.apellido,
            correo: form.correo,
            telefono: form.telefono,
            contraseña: form.contraseña,
            rol: form.rol,
        }

        if (form.rol === 'PACIENTE') {
            datos_usuario.paciente = {
                direccion: form.direccion,
                fecha_nacimiento: form.fechaNacimiento,
                telefono_emergencia: form.telefonoEmergencia,
            }
        }

        console.log(datos_usuario);

        try {

            const respuesta = await requestRegistrarUsuario(datos_usuario);
            console.log(respuesta);
            toast.success('Usuario registrado exitosamente');
            onSubmit?.(respuesta);

        } catch(error) {

            toast.error((error as ApiError).message)
        }
    }

    const esPaciente = form.rol === 'PACIENTE'

    return (
        <div className="form-card">

            <form onSubmit={handleSubmit}>
                <div className="form-header">
                    <p className="form-title">Nuevo usuario</p>
                    <p className="form-subtitle">Completa los datos del usuario a registrar.</p>
                </div>

                <div className="form-section">
                    <p className="section-label">Información general</p>
                    <div className="form-grid">

                        <div className="field">
                            <label>Nombre</label>
                            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Luis" />
                        </div>

                        <div className="field">
                            <label>Apellido</label>
                            <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="González" />
                        </div>

                        <div className="field">
                            <label>Teléfono</label>
                            <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="755 100 0001" />
                        </div>

                        <div className="field">
                            <label>Correo</label>
                            <input name="correo" type="email" value={form.correo} onChange={handleChange} placeholder="correo@dentissa.mx" />
                        </div>

                        <div className="field">
                            <label>Contraseña</label>
                            <input name="contraseña" type="password" value={form.contraseña} onChange={handleChange} placeholder="ooooooo" />
                        </div>

                        <div className="field field--full">
                            <label>Rol</label>
                            <select name="rol" value={form.rol} onChange={handleChange}>
                                <option value="" disabled>Seleccionar rol</option>
                                <option value="ADMINISTRADOR">Administrador</option>
                                <option value="ASISTENTE">Asistente</option>
                                <option value="PACIENTE">Paciente</option>
                            </select>
                        </div>

                    </div>
                </div>


                {esPaciente && (
                    <div className="form-section form-section--paciente">
                        <p className="section-label">Datos del paciente</p>
                        <div className="form-grid">

                            <div className="field field--full">
                                <label>Dirección</label>
                                <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle, número, colonia" />
                            </div>

                            <div className="field">
                                <label>Teléfono de emergencia</label>
                                <input name="telefonoEmergencia" value={form.telefonoEmergencia} onChange={handleChange} placeholder="755 100 0002" />
                            </div>

                            <div className="field">
                                <label>Fecha de nacimiento</label>
                                <input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} />
                            </div>

                        </div>
                    </div>
                )}

                <div className="form-footer">
                    <button className="btn-cancel" type="button" onClick={onCancel}>Cancelar</button>
                    <button className="btn-registrar" type="submit" >Guardar usuario</button>
                </div>

            </form>

        </div>
    )
}