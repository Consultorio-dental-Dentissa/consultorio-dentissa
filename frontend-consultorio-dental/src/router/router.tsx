import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "../pages/Home"
import About from "../pages/Sobre-nosotros"
import Login from "../pages/Login"
import Servicios from "../pages/Servicios"
import Registrarse from "../pages/Registrarse"
import Dashboard from "../pages/Dashboard"
import LayoutPublico from "../layouts/PublicLayout"
import LayoutPrivado from "../layouts/PrivateLayout"

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

                </Route>

            </Routes>
        </BrowserRouter>
    )
}