import { Outlet } from "react-router-dom"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContextProvider"
import { Navigate } from "react-router-dom";
import '../styles/theme.private.css';
import logoDentissa from '../assets/logoDentissa.png';


import { FaRegNewspaper } from "react-icons/fa6";
import { FiUser } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaLaptopMedical } from "react-icons/fa6";
import { IoGitNetworkOutline } from "react-icons/io5";
import { FaRegQuestionCircle } from "react-icons/fa";
import { MdOutlineLocalOffer } from "react-icons/md";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";





export default function LayoutPrivado() {

    const { isAuthenticated, setIsAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    console.log(isAuthenticated);

    const cerrarSesion = () => {
        console.log("cerrar sesion");
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    }

    return (
        <div className="layout">
            <nav className="menu-lateral">
                <div className="header-menu-lateral">
                    <div className="contenido-header">
                        <img className="logoDentissa" src={logoDentissa} />
                        <div className="texto-header">
                            <h2>Dentissa</h2>
                            <h4>Panel de control</h4>
                        </div>
                    </div>
                </div>

                <div className="contenedor-links">
                    <div className="seccion-menu">
                        <Link className="link" to="/dashboard"><FaRegNewspaper className="menu-icon" /> Resumen</Link>
                        <Link className="link" to="/pacientes"><FiUser className="menu-icon" /> Pacientes</Link>
                        <Link className="link" to="/citas"><FaRegCalendarAlt className="menu-icon" /> Citas</Link>
                        <Link className="link" to="/consultas"><FaLaptopMedical className="menu-icon" /> Consultas</Link>
                        <Link className="link" to="/usuarios"><FiUser className="menu-icon" /> Usuarios</Link>
                        <Link className="link" to="/servicios"><IoGitNetworkOutline className="menu-icon" /> Servicios</Link>
                    </div>
                    <div className="seccion-menu">
                        <Link className="link" to="/preguntas"><FaRegQuestionCircle className="menu-icon" /> Preguntas frecuentes</Link>
                        <Link className="link" to="/ofertas"><MdOutlineLocalOffer className="menu-icon" /> Ofertas</Link>
                        <Link className="link" to="/notificaciones"><IoIosNotificationsOutline className="menu-icon" /> Notificaciones</Link>
                    </div>
                </div>

                <div className="footer-menu-lateral">
                    <div className="contenedor-links">
                        <div className="seccion-menu">
                            <button id="logout-btn" className="link" onClick={cerrarSesion}><IoIosLogOut className="menu-icon"/> Cerrar sesion</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="main">
                <div className="header">
                    {/* Poner contenido aqui */}
                </div>
                <div className="contenedor-principal">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}