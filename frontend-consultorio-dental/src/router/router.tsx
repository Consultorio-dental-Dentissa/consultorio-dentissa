import { BrowserRouter, Routes, Route } from "react-router-dom"


// Vistas publicas
import HomePage from "../pages/public/home-page"
import About from "../pages/public/about-us-page"
import LoginPage from "../pages/public/login-page"
import RegisterPage from "../pages/public/register-page"
import PublicServicesPage from "../pages/public/public-services-page"


// Vistas privadas
import DashboardPage from "../pages/private/dashboard-page"
import UsersPage from "../pages/private/users-page"
import PatientsPage from "../pages/private/patients-page"
import ServicesPage from "../pages/private/services-page"
import AppointmentsPage from "@/pages/private/appointments-page"


// Layouts
import PublicLayout from "../layouts/public-layout"
import PrivateLayout from "../layouts/private-layout"
import ConsultationPage from "../pages/private/consultations-page"
import PerfilPaciente from "../pages/private/patient-profile-page"


export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/sobre-nosotros" element={<About />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/nuestros-servicios" element={<PublicServicesPage />} />
                    <Route path="/registrate" element={<RegisterPage />} />
                </Route>

                <Route element={<PrivateLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/usuarios" element={<UsersPage />} />
                    <Route path="/pacientes" element={<PatientsPage />} />
                    <Route path="/pacientes/:id" element={<PerfilPaciente />} />

                    <Route path="/servicios" element={<ServicesPage />} />
                    <Route path="/citas" element={<AppointmentsPage />} />
                    <Route path="/consultas" element={<ConsultationPage />} />
                </Route>

            </Routes>
        </BrowserRouter>
    )
}