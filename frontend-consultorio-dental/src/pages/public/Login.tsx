// Login.tsx
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../context/AuthContextProvider";

export default function Login() {

    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [errorFormulario, setErrorFormulario] = useState<string | null>('');
    const { login, loading, error, clearError } = useLogin();
    const { setIsAuthenticated, setUsuario } = useAuth();

    const manejarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(correo + contraseña);

        setErrorFormulario(null);
        clearError();

        if (!correo || !contraseña) {
            setErrorFormulario('Debes llenar todos los campos del formulario');
            return;
        }


        const respuesta = await login(correo, contraseña);

        if (respuesta?.estado) {

            // Autenticamos al usuario y guardamos sus datos
            setIsAuthenticated(true);
            setUsuario(respuesta.usuario);

            // Guardamos lo datos en el localStorage
            localStorage.setItem('token', respuesta.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
            localStorage.setItem('isAuthenticated', 'true');

            <Navigate to="/dashboard" />
        }


    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Bienvenido de nuevo</h2>
                    <p>Inicia sesión para acceder a tu cuenta</p>

                    {errorFormulario && <p style={{ color: "#ce1b1b" }}>{errorFormulario}</p>}
                    {error && <p style={{ color: "#ce1b1b" }}>{error}</p>}
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