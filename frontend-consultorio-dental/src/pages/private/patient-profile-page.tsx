import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePatients } from "../../hooks/use-patients"
import { formatPhone } from "@/utils/formatters"
import { Badge } from "@/components/ui/badge"

import type { Patient } from "@/types/models/patient"

function iniciales(nombre: string, apellido: string) {
    return `${nombre[0]}${apellido[0]}`.toUpperCase()
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

export default function PatientProfilePage() {

    const { id } = useParams()
    const idPatient = Number(id)
    const navigate = useNavigate()
    const { getPatient } = usePatients()
    const [patient, setPatient] = useState<Patient | null>(null);

    useEffect(() => {
        async function fetchPatientData() {
            const data = await getPatient(idPatient)
            setPatient(data)
        }
        fetchPatientData()
    }, [])

    if (!patient) return <div className="perfil-loading">Cargando paciente...</div>

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
                            {iniciales(patient.name, patient.lastname)}
                        </div>
                        <div>
                            <h1 className="perfil-nombre">
                                {patient.name} {patient.lastname}
                            </h1>
                            <div className="perfil-meta">
                                <Badge variant="base">Paciente</Badge>
                                <span className="perfil-id">
                                    #{patient.id.toString().padStart(4, '0')}
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
                        <span className="perfil-row-val">{patient.email}</span>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">Teléfono</span>
                        <span className="perfil-row-val">{formatPhone(patient.phone)}</span>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">Tel. emergencia</span>
                        <span className="perfil-row-val">{formatPhone(patient.emergency_phone)}</span>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">Dirección</span>
                        <span className="perfil-row-val">{patient.address}</span>
                    </div>
                </div>

                <div className="perfil-card">
                    <div className="perfil-card-head">
                        <div className="perfil-card-icon"><IconClinico /></div>
                        <p className="perfil-card-titulo">Datos clínicos</p>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">Fecha de nacimiento</span>
                        <span className="perfil-row-val">{patient.birth_date.toDateString()}</span>
                    </div>
                    <div className="perfil-row">
                        <span className="perfil-row-key">ID paciente</span>
                        <span className="perfil-row-val">#{patient.id.toString().padStart(4, '0')}</span>
                    </div>
                </div>

            </div>

        </div>
    )
}