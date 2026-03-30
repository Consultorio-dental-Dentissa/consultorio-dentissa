// Login.tsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../context/AuthContextProvider";
import toast from "react-hot-toast";

export default function Login() {

    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const navigate = useNavigate();
    const { login, loading, clearError } = useLogin();
    const { iniciarSesion } = useAuth();

    const manejarSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        clearError();

        if (!correo || !contraseña) {
            toast.error('Debes llenar todos los campos del formulario');
            return;
        }

        const credenciales = { correo: correo, contraseña: contraseña };

        try {
            const respuesta = await login(credenciales);

            if (respuesta?.estado) {

                iniciarSesion(respuesta.usuario, respuesta.token);
                navigate('/login');
            }
        } catch (error) {
            toast.error((error as string));
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Bienvenido de nuevo</h2>
                    <p>Inicia sesión para acceder a tu cuenta</p>

                    {loading ? <p>Cargando...</p> : ''}

                </div>

                <form onSubmit={manejarSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={correo}
                            onChange={(e) => { setCorreo(e.target.value) }}
                            placeholder="ejemplo@correo.com"

                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={contraseña}
                            onChange={(e) => { setContraseña(e.target.value) }}
                            placeholder="••••••••"

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

                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? <p>Cargando...</p> : <p>Iniciar sesión</p>}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes una cuenta? <Link to="/registrate">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
}