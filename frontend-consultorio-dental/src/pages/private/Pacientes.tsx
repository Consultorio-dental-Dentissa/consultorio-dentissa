import { useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";

export default function Pacientes() {

    const [pacientes, setPacientess] = useState<object | null>(null)

    return (
        <div>
            <TituloPanel
                titulo="Panel de pacientes"
                subtitulo="Aqui puedes manejar tus pacientes"
            />
        </div>
    );

}