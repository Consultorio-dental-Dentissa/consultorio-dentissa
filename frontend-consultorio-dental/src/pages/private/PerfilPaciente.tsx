import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePacientes } from "../../hooks/usePacientes"
import type { RespuestaPaciente } from "../../types/respuestas/RespuestaPaciente"


function iniciales(nombre: string, apellido: string) {
    return `${nombre[0]}${apellido[0]}`.toUpperCase()
}

function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

const IconContacto = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
)

const IconClinico = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
)

export default function PerfilPaciente() {

    const { id } = useParams()
    const idPaciente = Number(id)
    const navigate = useNavigate()
    const { obtenerPaciente } = usePacientes()
    const [paciente, setPaciente] = useState<RespuestaPaciente | null>(null);

    useEffect(() => {
        async function cargarDatosDelPaciente() {
            const data = await obtenerPaciente(idPaciente)
            setPaciente(data)
        }
        cargarDatosDelPaciente()
    }, [])

    if (!paciente) return <div className="perfil-loading">Cargando paciente...</div>

    return (
        <div className="perfil-page">

            {/* HEADER GRANDE */}
            <div className="perfil-header">

                <button className="perfil-back" onClick={() => navigate(-1)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Pacientes
                </button>

                <div className="perfil-hero">
                    <div className="perfil-hero-left">
                        <div className="perfil-avatar">
                            {iniciales(paciente.usuario.nombre, paciente.usuario.apellido)}
                        </div>
                        <div>
                            <h1 className="perfil-nombre">
                                {paciente.usuario.nombre} {paciente.usuario.apellido}
                            </h1>
                            <div className="perfil-meta">
                                <span className="perfil-badge">
                                    <span className="perfil-badge-dot" />
                                    Paciente
                                </span>
                                <span className="perfil-id">
                                    #{paciente.id.toString().padStart(4, '0')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* CARDS */}
            <div className="perfil-body">

                <div className="perfil-card">
                    <div className="perfil-card-head">
                        <div className="perfil-card-icon"><IconContacto /></div>
                        <p className="perfil-card-titulo">Información de contacto</p>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">Correo</span>
                        <span className="perfil-row-val">{paciente.usuario.correo}</span>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">Teléfono</span>
                        <span className="perfil-row-val">{paciente.usuario.telefono}</span>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">Tel. emergencia</span>
                        <span className="perfil-row-val">{paciente.telefono_emergencia}</span>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">Dirección</span>
                        <span className="perfil-row-val">{paciente.direccion}</span>
                    </div>
                </div>

                <div className="perfil-card">
                    <div className="perfil-card-head">
                        <div className="perfil-card-icon"><IconClinico /></div>
                        <p className="perfil-card-titulo">Datos clínicos</p>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">Fecha de nacimiento</span>
                        <span className="perfil-row-val">{formatearFecha(paciente.fecha_nacimiento)}</span>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">ID paciente</span>
                        <span className="perfil-row-val">#{paciente.id.toString().padStart(4, '0')}</span>
                    </div>
                </div>

            </div>

        </div>
    )
}