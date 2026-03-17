import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContextProvider";

export default function Login() {

  const { setIsAuthenticated, setUsuario } = useAuth();
  const { login, loading, error, clearError } = useLogin();

  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('')
  const [formError, setFormError] = useState<string | null>(null);


  /**
   * Preguntar al contexto global si el usuario esta authenticado
   * si lo esta, renviarlo directamente al dashboard para que no
   * vueva a iniciar sesión a menos que haya cerrado la que tiene
   * avierta
   */


  const manejarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setFormError(null);
    clearError();

    if (!correo || !contraseña) {
      setFormError('Debes llenar todos los campos.');
      return;
    }

    const respuesta = await login(correo, contraseña);

    if (respuesta?.estado) {

      setIsAuthenticated(true);
      setUsuario(respuesta.usuario);

      // Guardamos todo en el LocalStorage
      localStorage.setItem('token', respuesta.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
      localStorage.setItem('isAuthenticated', "true");

      return <Navigate to="/dashboard" replace/>
    }
  }


  return (
    <div className="contenedor-login">
      <div className="contenedor-formulario">

        {error && <h2>{error}</h2>}
        {formError && <h2>{formError}</h2>}


        {loading ? <h2>Cargando...</h2> : ''}

        <form className="formulario-login" onSubmit={manejarSubmit}>
          <h2>Iniciar sesión</h2>

          <div>
            <label htmlFor="">Correo electronico</label>
            <input type="text" id="correo" onChange={(e) => setCorreo(e.target.value)} />

            <label htmlFor="">Contraseña</label>
            <input type="password" id="contraseña" onChange={(e) => setContraseña(e.target.value)} />
          </div>

          <div>
            <button disabled={loading} className="btn btn-login">Iniciar sesión</button>
            <button className="btn btn-registrate" type="button">Registrate</button>
          </div>
        </form>
      </div>
    </div>

  )
}