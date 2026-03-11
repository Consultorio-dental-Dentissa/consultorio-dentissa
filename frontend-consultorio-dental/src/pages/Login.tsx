import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Cookies from "js-cookie";


export default function Login() {

  const { login, error } = useAuth();

  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');


  const manejarClick = async () => {

    const credenciales = {
      correo: correo,
      contraseña: contraseña
    }

    const respuesta = await login(credenciales);

    if (error) {
      setMensaje(error);
    }

    if (respuesta) {
      setMensaje(respuesta.message);
    }

  }


  return (
    <div>
      <h1>Login</h1>

      <h3>{mensaje}</h3>

      <h2>Iniciar sesión</h2>
      <form>
        <label htmlFor="">correo electronico</label>
        <input type="text" id="correo" onChange={(e) => setCorreo(e.target.value)} />

        <label htmlFor="">Contraseña</label>
        <input type="password" id="contraseña" onChange={(e) => setContraseña(e.target.value)} />

        <button type="button" onClick={manejarClick}>Iniciar sesión</button>

      </form>
    </div>
  )
}