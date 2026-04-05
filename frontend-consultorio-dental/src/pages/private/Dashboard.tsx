import { FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContextProvider";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaLaptopMedical } from "react-icons/fa6";
import { IoGitNetworkOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { TituloPanel } from "@/components/common/TituloPanel";

export default function Dashboard() {

  const { usuario } = useAuth();

  return (
    <div>
      
      <TituloPanel
        titulo={`Bienvenid@, ${usuario && usuario.nombre}`}
        subtitulo="qui esta el resumen de tu consultorio dental"
      />

      <section className="contenedor-fichas-dashboard">
        <Link to="/pacientes" className="ficha-dashboard pacientes">

          <div className="seccion-derecha">
            <FiUser className="ficha-icon" />
          </div>

          <div className="seccion-izquierda">

          </div>

        </Link>

        <Link to="/citas" className="ficha-dashboard citas">

          <div className="seccion-izquierda">
            <FaRegCalendarAlt className="ficha-icon" />
          </div>

          <div className="seccion-derecha">

          </div>

        </Link>

        <Link to="/consultas" className="ficha-dashboard consultas">

          <div className="seccion-izquierda">
            <FaLaptopMedical className="ficha-icon" />
          </div>

          <div className="seccion-derecha">

          </div>

        </Link>

        <Link to="/servicios" className="ficha-dashboard servicios">

          <div className="seccion-izquierda">
            <IoGitNetworkOutline className="ficha-icon" />
          </div>

          <div className="seccion-derecha">

          </div>

        </Link>
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