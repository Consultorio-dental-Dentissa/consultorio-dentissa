import { useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";

export default function Servicios() {

    const [servicios, setServicios] = useState<object | null>(null)

    return (
        <div>
            <TituloPanel
                titulo="Panel de servicios"
                subtitulo="Aqui puedes manejar tus servicios"
            />
        </div>
    );

}