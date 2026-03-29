import { Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContextProvider"
import { Navigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import '../styles/theme.private.css';

export default function LayoutPrivado() {

    const { isAuthenticated, cerrarSesion, loading } = useAuth();

    if (loading) return null;
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const manejarCerrarSesion = () => {
        cerrarSesion();
        <Navigate to="/login"/>
    }

    return (
        <div className="layout">
            
            <Sidebar 
                logout={manejarCerrarSesion}
            />

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