export default function AboutUsPage() {
    const team = [
        {
            id: 1,
            nombre: "Dra. María González",
            especialidad: "Cardiología",
            experiencia: "15 años",
            imagen: "👩‍⚕️",
            descripcion: "Especialista en cardiología intervencionista, formada en el Hospital Italiano."
        },
        {
            id: 2,
            nombre: "Dr. Carlos Rodríguez",
            especialidad: "Neurología",
            experiencia: "12 años",
            imagen: "👨‍⚕️",
            descripcion: "Experto en enfermedades neurodegenerativas y trastornos del movimiento."
        },
        {
            id: 3,
            nombre: "Dra. Laura Martínez",
            especialidad: "Pediatría",
            experiencia: "10 años",
            imagen: "👩‍⚕️",
            descripcion: "Pediatra con enfoque en desarrollo infantil y neonatología."
        },
        {
            id: 4,
            nombre: "Dr. Roberto Sánchez",
            especialidad: "Traumatología",
            experiencia: "18 años",
            imagen: "👨‍⚕️",
            descripcion: "Especialista en cirugía de rodilla y medicina deportiva."
        }
    ];

    const values = [
        {
            titulo: "Excelencia médica",
            descripcion: "Nos comprometemos con la actualización constante y la mejor práctica clínica."
        },
        {
            titulo: "Atención personalizada",
            descripcion: "Cada paciente es único y merece un tratamiento adaptado a sus necesidades."
        },
        {
            titulo: "Compromiso ético",
            descripcion: "Actuamos con transparencia, honestidad y respeto en cada decisión."
        },
        {
            titulo: "Innovación",
            descripcion: "Incorporamos tecnología de vanguardia para diagnósticos más precisos."
        }
    ];

    return (
        <div className="sobrenosotros-container">
            {/* Hero section */}
            <section className="sobrenosotros-hero">
                <div className="sobrenosotros-hero-content">
                    <h1>Sobre Nosotros</h1>
                    <p>
                        Más de 15 años cuidando la salud de nuestra comunidad con 
                        profesionalismo, calidez y compromiso.
                    </p>
                </div>
            </section>

            {/* Historia */}
            <section className="historia-section">
                <div className="historia-contenido">
                    <div className="historia-texto">
                        <h2>Nuestra historia</h2>
                        <p>
                            El Consultorio Médico nació en 2008 con la visión de crear un espacio 
                            de atención médica integral, donde los pacientes pudieran encontrar 
                            todas las especialidades en un mismo lugar.
                        </p>
                        <p>
                            Lo que comenzó como un pequeño consultorio con dos especialidades, 
                            hoy es un centro médico de referencia con más de 20 especialidades 
                            y un equipo de profesionales altamente calificados.
                        </p>
                        <p>
                            Nuestro crecimiento se basa en un principio fundamental: la calidad 
                            humana y profesional en cada atención. Creemos que la salud va más 
                            allá de los diagnósticos y tratamientos; se trata de acompañar a 
                            nuestros pacientes en cada etapa de su vida.
                        </p>
                    </div>
                    <div className="historia-stats">
                        <div className="stat-card">
                            <span className="stat-number">15+</span>
                            <span className="stat-label">Años de experiencia</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">20+</span>
                            <span className="stat-label">Especialidades</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">30+</span>
                            <span className="stat-label">Profesionales</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">10k+</span>
                            <span className="stat-label">Pacientes</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Misión y Visión */}
            <section className="mision-vision-section">
                <div className="mision-vision-grid">
                    <div className="mision-card">
                        <div className="card-icon">🎯</div>
                        <h3>Misión</h3>
                        <p>
                            Brindar atención médica de excelencia, accesible y humanizada, 
                            promoviendo la prevención y el cuidado integral de la salud de 
                            nuestros pacientes y sus familias.
                        </p>
                    </div>
                    <div className="vision-card">
                        <div className="card-icon">👁️</div>
                        <h3>Visión</h3>
                        <p>
                            Ser reconocidos como el centro médico líder en la región, 
                            destacándonos por nuestra calidad asistencial, innovación 
                            tecnológica y calidez en el trato.
                        </p>
                    </div>
                </div>
            </section>

            {/* Valores */}
            <section className="valores-section">
                <h2>Nuestros valores</h2>
                <div className="valores-grid">
                    {values.map((valor, index) => (
                        <div key={index} className="valor-card">
                            <h3>{valor.titulo}</h3>
                            <p>{valor.descripcion}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Equipo médico */}
            <section className="equipo-section">
                <h2>Equipo médico</h2>
                <div className="equipo-grid">
                    {team.map(miembro => (
                        <div key={miembro.id} className="miembro-card">
                            <div className="miembro-imagen">{miembro.imagen}</div>
                            <h3>{miembro.nombre}</h3>
                            <p className="miembro-especialidad">{miembro.especialidad}</p>
                            <p className="miembro-experiencia">{miembro.experiencia} de experiencia</p>
                            <p className="miembro-descripcion">{miembro.descripcion}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Instalaciones */}
            <section className="instalaciones-section">
                <h2>Nuestras instalaciones</h2>
                <div className="instalaciones-grid">
                    <div className="instalacion-card">
                        <div className="instalacion-icon">🏥</div>
                        <h3>Consultorios equipados</h3>
                        <p>Espacios modernos con tecnología de última generación para tu atención.</p>
                    </div>
                    <div className="instalacion-card">
                        <div className="instalacion-icon">🔬</div>
                        <h3>Laboratorio propio</h3>
                        <p>Realizamos análisis clínicos con resultados rápidos y confiables.</p>
                    </div>
                    <div className="instalacion-card">
                        <div className="instalacion-icon">📊</div>
                        <h3>Diagnóstico por imágenes</h3>
                        <p>Radiografías, ecografías y más estudios en el mismo lugar.</p>
                    </div>
                    <div className="instalacion-card">
                        <div className="instalacion-icon">♿</div>
                        <h3>Accesibilidad</h3>
                        <p>Instalaciones adaptadas para personas con movilidad reducida.</p>
                    </div>
                </div>
            </section>

            {/* Contacto rápido */}
            <section className="contacto-rapido-section">
                <h2>¿Querés conocernos?</h2>
                <p>Visitanos en nuestro consultorio o contactanos para más información.</p>
                <div className="contacto-rapido-info">
                    <div className="info-item">
                        <span className="info-icon">📍</span>
                        <div>
                            <strong>Dirección:</strong>
                            <p>Av. Siempre Viva 123, Ciudad</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">📞</span>
                        <div>
                            <strong>Teléfono:</strong>
                            <p>(011) 1234-5678</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">✉️</span>
                        <div>
                            <strong>Email:</strong>
                            <p>info@consultorio.com</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}