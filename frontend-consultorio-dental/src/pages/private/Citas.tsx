import { TituloPanel } from "@/components/common/TituloPanel"
import { Button } from "@/components/ui/button"
import { useCitas } from "@/hooks/useCitas";
import { useEffect, useState } from "react"

import type { RespuestaCita } from "@/types/api/responses/RespuestaCita"

export default function Citas() {

    const [citas, setCitas] = useState<RespuestaCita[]>([]);
    const { obtenerCitas } = useCitas();

    useEffect(() => {

        async function cargarCitas() {
            const citas = await obtenerCitas();
            setCitas(citas);
        }

        cargarCitas();
    }, []);

    console.log(citas);

    return (
        <>
            <TituloPanel
                titulo="Citas"
                subtitulo="Aqui puedes manejar tus citas"
            />

            <div className="flex flex-row justify-end mb-5">
                <Button className="mt-5 bg-rose-500">Exportar citas</Button>
            </div>

            <div className="flex flex-row justify-between bg-white w-full px-5 py-3 rounded-xl">
                <div className="flex flex-row gap-5">
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2">Pendientes</button>
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2">Confirmadas</button>
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2">Canceladas</button>
                </div>

                <div className="flex flex-row gap-2">
                    <Button variant="outline">Filtros</Button>
                    <Button variant="outline">Agendar cita</Button>
                </div>
            </div>
        </>
    )
}