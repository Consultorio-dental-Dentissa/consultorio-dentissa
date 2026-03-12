import { Outlet } from "react-router-dom"
import { Link } from "react-router-dom"

export default function NavbarPublico() {
    return (
        <div className="layout">
            <nav className="navbar-publico">

                <div className="contenedor-titulo-principal">
                    <Link className="logo-navbar" to="/">Consultorio</Link>
                </div>

                <div className="contenedor-links">
                    <Link className="link" to="/">Principal</Link>
                    <Link className="link" to="/servicios">Servicios</Link>
                    <Link className="link" to="/sobre-nosotros">Sobre nosotros</Link>
                    <Link className="link login" to={"/registrate"}>Registrarse</Link>
                    <Link className="link login" to="/login">Iniciar sesion</Link>
                    
                </div>

            </nav>

            <main className="main">
                <div className="contenedor-principal">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}