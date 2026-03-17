import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContextProvider";
import { Navigate } from "react-router-dom";
import '../styles/theme.public.css'

export default function LayoutPublico() {

    
    const { isAuthenticated, usuario } = useAuth();

    console.log(isAuthenticated + ' - ' + usuario);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="public-layout">
            <nav className="navbar-publico">

                <div className="contenedor-titulo-principal">
                    <Link className="logo-navbar" to="/">Publico</Link>
                </div>

                <div className="public-contenedor-links">
                    <Link className="link" to="/">Principal</Link>
                    <Link className="link" to="/servicios">Servicios</Link>
                    <Link className="link" to="/sobre-nosotros">Sobre nosotros</Link>
                    <Link className="link login" to={"/registrate"}>Registrarse</Link>
                    <Link className="link login" to="/login">Iniciar sesion</Link>
                </div>

            </nav>

            <main className="main">
                <div className="public-contenedor-principal">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}