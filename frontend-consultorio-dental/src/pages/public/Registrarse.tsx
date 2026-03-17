// Registrarse.tsx
import { Link } from "react-router-dom";
import { useState } from "react";
import type { RegistrarUsuario } from "../../types/RegistrarUsuario";
import { useRegister } from "../../hooks/useRegister";

export default function Registrarse() {

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [telefonoEmergencia, setTelefonoEmergencia] = useState('');

    const [errorFormulario, setErrorFormulario] = useState<string | null>('');

    const { register, error, loading, clearError } = useRegister();

    const [success, setSuccess] = useState('');

    const manejarSubmit = async (e: React.SubmitEvent) => {

        e.preventDefault();
        clearError();

        if (
            !nombre || !apellido || !contraseña ||
            !correo || !telefono || !direccion ||
            !fechaNacimiento || !telefonoEmergencia
        ) {
            setErrorFormulario('Debes llenar todos los campos del formulario');
            return;
        }

        setErrorFormulario(null);

        // Creamos el objeto usuario
        const usuario : RegistrarUsuario = {
            nombre: nombre,
            apellido: apellido,
            correo: correo,
            telefono: telefono,
            contraseña: contraseña,
            rol: 'PACIENTE',
            paciente: {
                direccion: direccion,
                fecha_nacimiento: fechaNacimiento,
                telefono_emergencia: telefonoEmergencia
            }
        }

        const respuesta = await register(usuario);

        if (respuesta) {
            setSuccess('Te has registrado exitosamente');
            console.log(usuario);

            return;
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h2>Crear una cuenta</h2>
                    <p>Completa tus datos para registrarte</p>

                    {errorFormulario && <p style={{color: 'red'}} >{errorFormulario}</p>}
                    {error && <p style={{color: 'red'}} >{error}</p>}

                    {success && <p style={{color: "green"}}>{success}</p>}
                    {loading ? <p>Cargando...</p> : ''}

                </div>

                <form onSubmit={manejarSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={nombre}
                                onChange={(e) => { setNombre(e.target.value) }}
                                placeholder="Tu nombre"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={apellido}
                                onChange={(e) => { setApellido(e.target.value) }}
                                placeholder="Tu apellido"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={correo}
                            onChange={(e) => { setCorreo(e.target.value) }}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                type="tel"
                                id="telefono"
                                name="telefono"
                                value={telefono}
                                onChange={(e) => { setTelefono(e.target.value) }}
                                placeholder="+54 9 11 1234-5678"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono de emergencia</label>
                            <input
                                type="tel"
                                id="telefono"
                                name="telefono"
                                value={telefonoEmergencia}
                                onChange={(e) => { setTelefonoEmergencia(e.target.value) }}
                                placeholder="+54 9 11 1234-5678"
                            />
                        </div>
                    </div>


                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={contraseña}
                                onChange={(e) => { setContraseña(e.target.value) }}
                                placeholder="Mínimo 8 caracteres"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Direccion</label>
                            <input
                                type="texxt"
                                id="direccion"
                                name="diraccion"
                                value={direccion}
                                onChange={(e) => { setDireccion(e.target.value) }}
                                placeholder="Escribe tu diraccion"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Fecha de nacimiento</label>
                        <input
                            type="date"
                            id="fechaNacimiento"
                            name="fechaNacimiento"
                            value={fechaNacimiento}
                            onChange={(e) => { setFechaNacimiento(e.target.value) }}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>

                    <div className="terms-group">
                        <label className="checkbox-label">
                            <input type="checkbox" required /> Acepto los <Link to="/terminos">términos y condiciones</Link> y la <Link to="/privacidad">política de privacidad</Link>
                        </label>
                    </div>

                    <button type="submit" className="auth-button">
                        Registrarse
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    );
}