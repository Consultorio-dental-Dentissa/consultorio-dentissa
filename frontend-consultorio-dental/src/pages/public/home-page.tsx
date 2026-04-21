import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Tu salud es nuestra prioridad</h1>
                    <p>
                        Atención médica de calidad con los mejores profesionales.
                        Agendá tu cita de manera rápida y sencilla.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/registrate" className="btn-primary">
                            Comenzar ahora
                        </Link>
                        <Link to="/servicios" className="btn-secondary">
                            Ver servicios
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>¿Por qué elegirnos?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">👨‍⚕️</div>
                        <h3>Profesionales Expertos</h3>
                        <p>Médicos especialistas con amplia experiencia en cada área de la salud.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⏰</div>
                        <h3>Horarios Flexibles</h3>
                        <p>Turnos disponibles que se adaptan a tu rutina diaria y necesidades.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💻</div>
                        <h3>Reserva Online</h3>
                        <p>Agendá tus citas de manera rápida y sencilla desde cualquier dispositivo.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🏥</div>
                        <h3>Instalaciones Modernas</h3>
                        <p>Equipamiento de última tecnología para garantizar los mejores diagnósticos.</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section">
                <div className="about-content">
                    <div className="about-text">
                        <h2>Sobre nosotros</h2>
                        <p>
                            Con más de 15 años de experiencia, nuestro consultorio médico 
                            se ha convertido en un referente de calidad y confianza en la 
                            comunidad. Contamos con un equipo multidisciplinario comprometido 
                            con tu bienestar.
                        </p>
                        <div className="stats">
                            <div className="stat-item">
                                <span className="stat-number">15+</span>
                                <span className="stat-label">Años de experiencia</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">10k+</span>
                                <span className="stat-label">Pacientes atendidos</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">20+</span>
                                <span className="stat-label">Especialidades</span>
                            </div>
                        </div>
                    </div>
                    <div className="about-image">
                        <div style={{ fontSize: '80px' }}>🏥</div>
                        <h3 style={{ marginTop: '20px' }}>Compromiso con tu salud</h3>
                        <p style={{ marginTop: '10px', opacity: '0.9' }}>
                            Tu bienestar es nuestra misión
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <h2>¿Listo para cuidar tu salud?</h2>
                <p>
                    No esperes más para recibir la atención que mereces. 
                    Reservá tu turno hoy mismo.
                </p>
                <Link to="/registrate" className="btn-primary btn-large">
                    Solicitar turno
                </Link>
            </section>
        </div>
    );
}