import { useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";

export default function Consultas() {

    const [consultas, setConsultas] = useState<object | null>(null)

    return (
        <div>
            <TituloPanel
                titulo="Panel de consultas"
                subtitulo="Aqui puedes manejar tus consultas"
            />
        </div>
    );

}