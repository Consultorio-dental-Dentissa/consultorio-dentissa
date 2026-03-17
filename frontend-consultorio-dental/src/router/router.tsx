import { BrowserRouter, Routes, Route } from "react-router-dom"


// Vistas publicas
import  Home  from "../pages/public/Home"
import  About  from "../pages/public/Sobre-nosotros"
import  Login  from "../pages/public/Login"
import  Registrarse  from "../pages/public/Registrarse"


// Vistas privadas
import Dashboard from "../pages/private/Dashboard"
import Usuarios from "../pages/private/Usuarios"
import Pacientes  from "../pages/private/Pacientes"
import Servicios from "../pages/private/Servicios"


// Layouts
import LayoutPublico from "../layouts/PublicLayout"
import LayoutPrivado from "../layouts/PrivateLayout"
import Citas from "../pages/private/Citas"
import Consultas from "../pages/private/Consultas"


export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<LayoutPublico />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/sobre-nosotros" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/servicios" element={<Servicios />}/>
                    <Route path="/registrate" element={<Registrarse />}/>
                </Route>

                <Route element={<LayoutPrivado />}>
                    <Route path="/dashboard" element={<Dashboard />}/>
                    <Route path="/usuarios" element={<Usuarios />}/>
                    <Route path="/pacientes" element={<Pacientes />}/>
                    <Route path="/servicios" element={<Pacientes />}/>
                    <Route path="/citas" element={<Citas />}/>
                    <Route path="/consultas" element={<Consultas />}/>
                </Route>

            </Routes>
        </BrowserRouter>
    )
}