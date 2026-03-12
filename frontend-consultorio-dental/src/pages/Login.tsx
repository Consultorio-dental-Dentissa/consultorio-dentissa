import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {

  const { login, error } = useAuth();

  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');



  const manejarClick = async () => {

    const credenciales = {
      correo: correo,
      contraseña: contraseña
    }

    const respuesta = await login(credenciales);

    if (error) {
      alert(error);
    }

    if (respuesta) {
      alert(respuesta.message)
    }
  }


  return (
    <div className="contenedor-login">
      <div className="contenedor-formulario">


        <form className="formulario-login">
          <h2>Iniciar sesión</h2>

          <div>
            <label htmlFor="">Correo electronico</label>
            <input type="text" id="correo" onChange={(e) => setCorreo(e.target.value)} />

            <label htmlFor="">Contraseña</label>
            <input type="password" id="contraseña" onChange={(e) => setContraseña(e.target.value)} />
          </div>

          <div>
            <button className="btn btn-login" type="button" onClick={manejarClick}>Iniciar sesión</button>
            <button className="btn btn-registrate" type="button">Registrate</button>
          </div>


        </form>
      </div>
    </div>

  )
}