import { TituloPanel } from "@/components/common/TituloPanel"
import { Button } from "@/components/ui/button"

export default function Citas() {

    return (
        <>
            <TituloPanel
                titulo="Citas"
                subtitulo="Aqui puedes manejar tus citas"
            />

            <div className="flex flex-row justify-end mb-5">
                <Button className="mt-5 bg-rose-500">Exportar citas</Button>
            </div>

            <div className="bg-white w-full p-5 rounded-xl">
                <div className="flex flex-row gap-5">
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2">Pendientes</button>
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2">Confirmadas</button>
                    <button className="text-gray-500 focus:text-rose-500 focus:border-b focus:border-b-rose-500 focus:border-b-2">Canceladas</button>
                </div>
            </div>
        </>
    )
}