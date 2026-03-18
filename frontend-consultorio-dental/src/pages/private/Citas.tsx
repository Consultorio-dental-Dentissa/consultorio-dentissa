import { useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";


export default function Citas() {

    const [citas, setCitas] = useState<object | null>(null)

    return (
        <div>
            <TituloPanel
                titulo="Panel de citas"
                subtitulo="Aqui puedes manejar tus citas"
            />
        </div>
    );

}