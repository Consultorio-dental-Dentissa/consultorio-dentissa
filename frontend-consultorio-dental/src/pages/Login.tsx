// Login.tsx
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica de login
        console.log("Login:", formData);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Bienvenido de nuevo</h2>
                    <p>Inicia sesión para acceder a tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <input type="checkbox" /> Recordarme
                        </label>
                        <Link to="/recuperar-password" className="forgot-password">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button type="submit" className="auth-button">
                        Iniciar sesión
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes una cuenta? <Link to="/registrate">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
}