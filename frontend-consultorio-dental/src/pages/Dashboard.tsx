import { FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContextProvider";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaLaptopMedical } from "react-icons/fa6";
import { IoGitNetworkOutline } from "react-icons/io5";


export default function Dashboard() {

  const { isAuthenticated, usuario } = useAuth()

  console.log("autenticado = " + isAuthenticated);
  console.log(usuario);

  return (
    <div>
      <div className="contenedor-titulos-principal">
        <h2>Bienvenid@, {usuario?.nombre}</h2>
        <h4>Aqui esta el resumen de tu consultorio dental</h4>
      </div>

      <section className="contenedor-fichas-dashboard">
        <div className="ficha-dashboard pacientes">

          <div className="seccion-derecha">
            <FiUser className="ficha-icon" />
          </div>

          <div className="seccion-izquierda">

          </div>

        </div>
        <div className="ficha-dashboard consultas">

          <div className="seccion-izquierda">
            <FaRegCalendarAlt className="ficha-icon" />
          </div>

          <div className="seccion-derecha">

          </div>

        </div>
        <div className="ficha-dashboard citas">

          <div className="seccion-izquierda">
            <FaLaptopMedical className="ficha-icon" />
          </div>

          <div className="seccion-derecha">

          </div>

        </div>
        <div className="ficha-dashboard servicios">

          <div className="seccion-izquierda">
            <IoGitNetworkOutline className="ficha-icon" />
          </div>

          <div className="seccion-derecha">

          </div>

        </div>
      </section>


      {/* Aqui ira la seccion de las citas */}
      <section>

        <div className="contenedor-seccion-titulo">
          <h3>Citas pendientes</h3>
          <h4>Aqui puedes ver las citas que tienes pendientes para el dia de hoy</h4>
        </div>

        <div className="contenedor-citas-de-hoy">
          
        </div>

      </section>





    </div>
  )
}