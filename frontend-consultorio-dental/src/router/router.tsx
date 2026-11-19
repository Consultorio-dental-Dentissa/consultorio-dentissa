import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Role } from "@/features/users/types/rol.enum";
import { RouteFallback } from "@/components/shared/route-fallback.component";

// Vistas publicas
const HomePage = lazy(() => import("@/pages/public/home-page"));
const About = lazy(() => import("@/pages/public/about-us-page"));
const LoginPage = lazy(() => import("@/pages/public/login-page"));
const SignUpPage = lazy(() => import("@/pages/public/sign-up-page"));
const ForgotPasswordPage = lazy(() => import("@/pages/public/forgot-password-page"));
const ResetPasswordPage = lazy(() => import("@/pages/public/reset-password-page"));
const PublicServicesPage = lazy(() => import("@/pages/public/public-services-page"));
const PublicOffersPage = lazy(() => import("@/pages/public/public-offers-page"));
const PublicFaqPage = lazy(() => import("@/pages/public/public-faq-page"));
const ContactPage = lazy(() => import("@/pages/public/contact-page"));
const NotFoundPage = lazy(() => import("@/pages/public/not-found-page"));

// Vistas privadas
const DashboardPage = lazy(() => import("@/pages/private/dashboard-page"));
const UsersPage = lazy(() => import("@/pages/private/users-page"));
const PatientsPage = lazy(() => import("@/pages/private/patients-page"));
const PatientProfilePage = lazy(() => import("@/pages/private/patient-profile-page"));
const MyProfilePage = lazy(() => import("@/pages/private/my-profile-page"));
const ServicesPage = lazy(() => import("@/pages/private/services-page"));
const AppointmentsPage = lazy(() => import("@/pages/private/appointments-page"));
const ConsultationsPage = lazy(() => import("@/pages/private/consultations-page"));
const NotificationsPage = lazy(() => import("@/pages/private/notifications-page"));
const FaqPage = lazy(() => import("@/pages/private/faq-page"));
const OffersPage = lazy(() => import("@/pages/private/offers-page"));
const AuditPage = lazy(() => import("@/pages/private/audit-page"));

// Layouts
import PublicLayout from "@/layouts/public-layout";
import AuthLayout from "@/layouts/auth-layout";
const PrivateLayout = lazy(() => import("@/layouts/private-layout"));
import RoleRoute from "@/layouts/role-route";

const { ADMINISTRADOR, ASISTENTE, PACIENTE } = Role;

export default function Router() {
    return (
        <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/sobre-nosotros" element={<About />} />
                    <Route path="/nuestros-servicios" element={<PublicServicesPage />} />
                    <Route path="/ofertas" element={<PublicOffersPage />} />
                    <Route path="/preguntas-frecuentes" element={<PublicFaqPage />} />
                    <Route path="/contacto" element={<ContactPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registrate" element={<SignUpPage />} />
                    <Route path="/olvide-mi-contrasena" element={<ForgotPasswordPage />} />
                    <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
                </Route>

                <Route element={<PrivateLayout />}>
                    <Route element={<RoleRoute allowedRoles={[ADMINISTRADOR]} />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/usuarios" element={<UsersPage />} />
                        <Route path="/consultas" element={<ConsultationsPage />} />
                        <Route path="/gestionar-ofertas" element={<OffersPage />} />
                        <Route path="/gestionar-preguntas" element={<FaqPage />} />
                        <Route path="/auditoria" element={<AuditPage />} />
                        <Route path="/servicios" element={<ServicesPage />} />
                    </Route>

                    <Route element={<RoleRoute allowedRoles={[ADMINISTRADOR, ASISTENTE]} />}>
                        <Route path="/pacientes" element={<PatientsPage />} />
                        <Route path="/pacientes/:id" element={<PatientProfilePage />} />
                    </Route>

                    <Route element={<RoleRoute allowedRoles={[ADMINISTRADOR, ASISTENTE, PACIENTE]} />}>
                        <Route path="/citas" element={<AppointmentsPage />} />
                        <Route path="/notificaciones" element={<NotificationsPage />} />
                    </Route>

                    {/* /mi-perfil: la página muestra "Mi perfil" (PACIENTE) o "Perfil de usuario" (ADMIN/ASISTENTE). */}
                    <Route element={<RoleRoute allowedRoles={[ADMINISTRADOR, ASISTENTE, PACIENTE]} />}>
                        <Route path="/mi-perfil" element={<MyProfilePage />} />
                    </Route>
                </Route>
            </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
