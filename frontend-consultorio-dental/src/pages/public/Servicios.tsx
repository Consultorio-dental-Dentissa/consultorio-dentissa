// Servicios.tsx
import { Link } from "react-router-dom";

export default function Servicios() {
    const servicios = [
        {
            id: 1,
            icon: "🫀",
            titulo: "Cardiología",
            descripcion: "Diagnóstico y tratamiento de enfermedades del corazón. Realizamos electrocardiogramas, ecocardiogramas y pruebas de esfuerzo.",
            duracion: "45 min",
            precio: "$1500"
        },
        {
            id: 2,
            icon: "🧠",
            titulo: "Neurología",
            descripcion: "Atención especializada para trastornos del sistema nervioso central y periférico.",
            duracion: "60 min",
            precio: "$1800"
        },
        {
            id: 3,
            icon: "🦷",
            titulo: "Odontología",
            descripcion: "Servicios de limpieza, extracciones, ortodoncia y tratamientos de conducto.",
            duracion: "30 min",
            precio: "$1200"
        },
        {
            id: 4,
            icon: "👁️",
            titulo: "Oftalmología",
            descripcion: "Exámenes de la vista, diagnóstico de enfermedades oculares y recetas de lentes.",
            duracion: "40 min",
            precio: "$1400"
        },
        {
            id: 5,
            icon: "🦴",
            titulo: "Traumatología",
            descripcion: "Atención de lesiones óseas, musculares y articulares. Rehabilitación física.",
            duracion: "50 min",
            precio: "$1600"
        },
        {
            id: 6,
            icon: "👶",
            titulo: "Pediatría",
            descripcion: "Atención integral para niños y adolescentes. Controles de crecimiento y vacunación.",
            duracion: "35 min",
            precio: "$1300"
        },
        {
            id: 7,
            icon: "⚕️",
            titulo: "Medicina General",
            descripcion: "Consultas médicas generales, chequeos preventivos y derivaciones a especialistas.",
            duracion: "30 min",
            precio: "$1000"
        },
        {
            id: 8,
            icon: "🧪",
            titulo: "Análisis Clínicos",
            descripcion: "Extracción y análisis de muestras de sangre, orina y otros estudios de laboratorio.",
            duracion: "20 min",
            precio: "$800"
        }
    ];

    const especialidades = [
        "Cardiología", "Neurología", "Odontología", "Oftalmología",
        "Traumatología", "Pediatría", "Medicina General", "Dermatología",
        "Ginecología", "Psicología", "Nutrición", "Fonoaudiología"
    ];

    return (
        <div className="servicios-container">
            {/* Hero section */}
            <section className="servicios-hero">
                <div className="servicios-hero-content">
                    <h1>Nuestros Servicios</h1>
                    <p>
                        Ofrecemos una amplia gama de especialidades médicas para cuidar 
                        de tu salud y la de tu familia con la mejor atención profesional.
                    </p>
                </div>
            </section>

            {/* Especialidades rápidas */}
            <section className="especialidades-section">
                <div className="especialidades-grid">
                    {especialidades.map((esp, index) => (
                        <div key={index} className="especialidad-tag">
                            {esp}
                        </div>
                    ))}
                </div>
            </section>

            {/* Lista de servicios */}
            <section className="servicios-lista-section">
                <h2>Servicios disponibles</h2>
                <div className="servicios-grid">
                    {servicios.map(servicio => (
                        <div key={servicio.id} className="servicio-card">
                            <div className="servicio-icon">{servicio.icon}</div>
                            <h3>{servicio.titulo}</h3>
                            <p className="servicio-descripcion">{servicio.descripcion}</p>
                            <div className="servicio-detalles">
                                <div className="servicio-detalle">
                                    <span className="detalle-label">Duración:</span>
                                    <span className="detalle-valor">{servicio.duracion}</span>
                                </div>
                                <div className="servicio-detalle">
                                    <span className="detalle-label">Precio:</span>
                                    <span className="detalle-valor precio">{servicio.precio}</span>
                                </div>
                            </div>
                            <Link to="/registrate" className="servicio-button">
                                Reservar turno
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Preguntas frecuentes */}
            <section className="faq-section">
                <h2>Preguntas frecuentes</h2>
                <div className="faq-grid">
                    <div className="faq-item">
                        <h3>¿Cómo puedo reservar un turno?</h3>
                        <p>Podés reservar tu turno a través de nuestro sitio web, seleccionando el servicio y horario que prefieras, o llamando a nuestro centro de atención telefónica.</p>
                    </div>
                    <div className="faq-item">
                        <h3>¿Aceptan obras sociales?</h3>
                        <p>Trabajamos con las principales obras sociales y prepagas. Consultá por la tuya al momento de reservar tu turno.</p>
                    </div>
                    <div className="faq-item">
                        <h3>¿Qué debo llevar a mi primera consulta?</h3>
                        <p>Debes llevar tu documento de identidad, orden médica si tenés, y estudios previos relacionados con tu consulta.</p>
                    </div>
                    <div className="faq-item">
                        <h3>¿Puedo cancelar o reprogramar mi turno?</h3>
                        <p>Sí, podés cancelar o reprogramar tu turno con hasta 24 horas de anticipación sin cargo, a través de nuestra web o por teléfono.</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="servicios-cta">
                <h2>¿Necesitas ayuda para elegir?</h2>
                <p>Nuestro equipo está disponible para asesorarte y encontrar el especialista que necesitas.</p>
                <Link to="/contacto" className="cta-button">Contactanos</Link>
            </section>
        </div>
    );
}