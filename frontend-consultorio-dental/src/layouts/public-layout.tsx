import { useNavigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PublicLayout() {

    const navigate = useNavigate();

    return (

        <div className="flex flex-col h-full px-25 bg-gray-50">
            <nav className="p-5 bg-gray-50 border-b border-gray-100">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        {/* Logo */}
                        <div className="px-10">
                            <a className="font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>Dentissa</a>
                        </div>

                        {/* Botones de secciones */}
                        <div>
                            <a className="p-2 rounded-lg hover:bg-gray-100" href="#seccion-inicio">Inicio</a>
                            <a className="p-2 rounded-lg hover:bg-gray-100" href="#seccion-sobre-nosotros">Sobre nosotros</a>
                            <a className="p-2 rounded-lg hover:bg-gray-100" href="#seccion-servicios">Servicios</a>
                            <a className="p-2 rounded-lg hover:bg-gray-100">Preguntas frecuentes</a>
                            <a className="p-2 rounded-lg hover:bg-gray-100" href="#seccion-contacto">Contacto</a>
                        </div>
                    </div>


                    {/* Botones del register y iniciar sesión */}
                    <div className="items-center flex gap-2 px-5">
                        <Button 
                            className="p-5 rounded-xl border border-gray-200 bg-white text-black transition-shadow duration-300 hover:shadow-lg hover:shadow-rose-200"
                            onClick={() => navigate('/login')}
                        >
                            Iniciar sesión
                        </Button>
                        <Button 
                            className="p-5 rounded-xl border-none font-bold bg-rose-300 text-white transition-shadow duration-300 hover:shadow-lg hover:shadow-rose-200"
                            onClick={() => navigate('/registrate')}
                        >
                            Registrarse
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="overflow-y-auto flex flex-col w-full h-full">
                <div className="w-full overflow-y h-auto px-15 py-5 bg-gray-50">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}