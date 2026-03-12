import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "../pages/Home"
import About from "../pages/Sobre-nosotros"
import Login from "../pages/Login"
import Servicios from "../pages/Servicios"
import NavbarPublico from "../layouts/PublicLayout"
import Registrarse from "../pages/Registrarse"

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<NavbarPublico />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/sobre-nosotros" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/servicios" element={<Servicios />}/>
                    <Route path="/registrate" element={<Registrarse />}/>
                </Route>

            </Routes>
        </BrowserRouter>
    )
}