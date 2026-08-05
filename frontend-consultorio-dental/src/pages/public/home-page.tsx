import { Button } from "@/components/ui/button";
import { useServices } from "@/features/services/hooks/use-services";
import { ArrowRight, BriefcaseMedical, Heart, Activity, Phone, Mail, ClipboardPlus } from "lucide-react";
import { useEffect } from "react";
import consultorioImg from '@/assets/consultorio.jpg';
import { useNavigate } from "react-router-dom";

export default function HomePage() {

    const navigate = useNavigate();
    const { servicesData, useGetAllServices } = useServices();

    useEffect(() => {
        useGetAllServices();
    }, []);

    return (

        <>
            <section className="flex pb-10 border-b bg-gray-50" id="seccion-inicio">
                <div className="flex flex-col gap-8 pt-10">
                    <div className="flex flex-col w-full">
                        <h2 className="font-bold flex text-6xl">Tu mejor sonrisa empieza en </h2>
                        <h2 className="font-bold text-6xl text-rose-400">Dentissa</h2>
                    </div>

                    <p className="text-gray-500 pr-50">
                        Consultorio dental con tecnología moderna y un equipo que cuida cada detalle. Agenda tu cita en línea y lleva el control de tu salud bucal desde un solo lugar.
                    </p>

                    <div className="flex gap-3">
                        <Button
                            className="bg-rose-300 p-6 rounded-xl font-bold"
                            
                            onClick={() => navigate('/registrate')}
                        >
                            Agenda tu primera cita <ArrowRight /></Button>
                        <a
                            className="p-3 rounded-xl font-bold border border-gray-200 bg-white text-gray-600"
                            href="#seccion-servicios"
                        >Ver servicios</a>
                    </div>

                    <div className="flex gap-4">
                        <div>
                            <p className="text-3xl font-bold">5+</p>
                            <p className="text-gray-400 text-xs font-bold">Años de experiencia</p>
                        </div>

                        <div>
                            <p className="text-3xl font-bold">{servicesData.length}</p>
                            <p className="text-gray-400 text-xs font-bold">Servicios</p>
                        </div>
                    </div>
                </div>


                <div className="w-full pt-10">
                    <img
                        className="rounded-3xl"
                        src={consultorioImg}
                        alt=""
                    />
                </div>
            </section>


            <section className="w-full bg-white py-10 px-10 flex justify-center items-center flex-col gap-2" id="seccion-sobre-nosotros">

                <div className="items-center flex flex-col gap-3 w-[50%] text-center">
                    <h2 className="font-medium text-rose-400">SOBRE NOSOTROS</h2>
                    <h2 className="font-bold text-3xl">Cuidamos tu salud mental como si fuera nuestra</h2>
                    <p className="text-gray-500 text-[15px] font-medium">
                        En Dentissa combinamos experiencia clínica, equipo de última generación y un trato humano. Nuestro objetivo es que cada visita sea cómoda, transparente y sin sorpresas.
                    </p>
                </div>

                <div className="w-full flex gap-5 mt-8">

                    <div className="p-5 rounded-xl border w-full flex flex-col gap-1 bg-gray-50">

                        <div className="p-3 bg-rose-100 rounded-xl">
                            <BriefcaseMedical size={30} className="text-red-400" />
                        </div>

                        <p className="font-bold text-lg">Equipo especializado</p>
                        <p className="text-sm text-gray-600 font-medium">Dentistas certificados en cada área, desde ortodoncia hasta cirugía.</p>
                    </div>

                    <div className="p-5 rounded-xl border w-full flex flex-col gap-1 bg-gray-50">

                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Heart size={30} className="text-blue-600" />
                        </div>

                        <p className="font-bold text-lg">Trato humano y cálido</p>
                        <p className="text-sm text-gray-600 font-medium">Te explicamos cada paso. Sin presiones, sin letras chiquitas.</p>
                    </div>

                    <div className="p-5 rounded-xl border w-full flex flex-col gap-1 bg-gray-50">

                        <div className="p-3 bg-green-100 rounded-xl">
                            <Activity size={30} className="text-green-500" />
                        </div>

                        <p className="font-bold text-lg">Tecnología moderna</p>
                        <p className="text-sm text-gray-600 font-medium">Diagnóstico digital y tratamientos precisos para tu comodidad.</p>
                    </div>

                </div>
            </section>




            <section className="p-10 border-t flex flex-col gap-3 border-b" id="seccion-servicios">
                <div className="flex flex-col gap-1">
                    <h2 className="font-medium text-rose-400">NUESTROS SERVICIOS</h2>
                    <h2 className="font-bold text-3xl">Tratamientos para toda la familia</h2>
                </div>

                <div className="flex gap-4 mt-5">

                    {
                        servicesData.length > 0 ?
                            servicesData.map(service => (
                                <div className="p-5 border bg-white rounded-xl w-[20%]">
                                    <div className="border-b pb-3">
                                        <p className="font-medium text-lg">{service.name}</p>
                                        <p className="text-gray-500 text-sm">{service.description}</p>
                                    </div>

                                    <p className="font-bold text-lg mt-3">
                                        ${service.price}
                                    </p>

                                </div>
                            ))

                            :

                            'No hay servicios'
                    }

                </div>
            </section>



            <section className="bg-white flex flex-col items-center p-10" id="seccion-contacto">
                <div className="items-center flex flex-col gap-3 w-[50%] text-center">
                    <h2 className="font-medium text-rose-400">CONTÁCTANOS</h2>
                    <h2 className="font-bold text-3xl">Estamos para atenderte</h2>
                </div>


                {/* Parte dividida de la info */}
                <div className="w-full flex mt-10 gap-5">
                    <div className="w-full">

                        {/* cards de info */}
                        <div className="flex flex-col gap-3">
                            <div className="w-full rounded-xl border p-5 flex gap-3">
                                <div className="bg-rose-100 p-3 rounded-xl">
                                    <Heart className="text-rose-400" />
                                </div>

                                <div className="flex flex-col justify-center">
                                    <p className="font-bold">Dirección</p>
                                    <p className="font-medium">Reforma 119, Centro, 60950 Ciudad. Lázaro Cardenas, Michoacan</p>
                                </div>
                            </div>

                            <div className="w-full rounded-xl border p-5 flex gap-3">
                                <div className="bg-blue-100 p-3 rounded-xl">
                                    <Phone className="text-blue-400" />
                                </div>

                                <div className="flex flex-col justify-center">
                                    <p className="font-bold">Telefono</p>
                                    <p className="font-medium">+52 223 454 3456</p>
                                </div>
                            </div>

                            <div className="w-full rounded-xl border p-5 flex gap-3">
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <Mail className="text-green-400" />
                                </div>

                                <div className="flex flex-col justify-center">
                                    <p className="font-bold">Correo electronico</p>
                                    <p className="font-medium">dentissa@gmail.com</p>
                                </div>
                            </div>

                            <div className="w-full rounded-xl border p-5 flex gap-3">
                                <div className="bg-orange-100 p-3 rounded-xl">
                                    <ClipboardPlus className="text-orange-400" />
                                </div>

                                <div className="flex flex-col justify-center">
                                    <p className="font-bold">Doctora</p>
                                    <p className="font-medium">Lic. Melissa Lopez Nuñez</p>
                                </div>
                            </div>
                        </div>

                        {/* Ubicación del consultorio */}
                        <div className="mt-5">
                            <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
                                <iframe
                                    title="Ubicación del consultorio"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3795.47635284691!2d-102.1980607!3d17.956561599999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x84315dc4d35dd69f%3A0xdcb3ac1122c287df!2sA%20Dent%20%22Sonrisas%20Sanas%22!5e0!3m2!1ses-419!2smx!4v1785127685969!5m2!1ses-419!2smx"
                                    className="w-full h-full border-0"
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-10 flex flex-col gap-2">

                        <p className="font-bold text-[25px]">Crea tu cuenta y agenda tu primera cita</p>
                        <p className="text-stone-500">
                            Regístrate en menos de un minuto para agendar en línea, ver tu historial clínico y recibir recordatorios de tus citas.
                        </p>

                        <div className="mt-5">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="bg-white tect-rose-300 rounded-full p-1 text-sm w-8 h-8 flex items-center justify-center">1</div>
                                    <p>Registrate con tu correo</p>
                                </div>

                                <div className="flex items-center gap-1">
                                    <div className="bg-white tect-rose-300 rounded-full p-1 text-sm w-8 h-8 flex items-center justify-center">2</div>
                                    <p>Elige servico, fecha y hora</p>
                                </div>

                                <div className="flex items-center gap-1">
                                    <div className="bg-white tect-rose-300 rounded-full p-1 text-sm w-8 h-8 flex items-center justify-center">3</div>
                                    <p>Recibe la confirmación de tu cita</p>
                                </div>

                            </div>
                        </div>

                        <div className="flex flex-col gap-5 mt-5">
                            <Button 
                                className="p-5 rounded-xl w-full font-bold"
                                onClick={() => navigate('/registrate')}
                                >
                                    Crear cuenta
                            </Button>
                            <Button 
                                className="p-5 rounded-xl w-full font-bold text-rose-400 bg-white border border-rose-300"
                                onClick={() => navigate('/login')}
                                >
                                    Iniciar sesión
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}