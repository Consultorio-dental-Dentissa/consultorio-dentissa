import { useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";

export default function Usuarios() {

    const [usuarios, setUsuarios] = useState<object | null>(null)

    return (
        <div>
            <TituloPanel
                titulo="Panel de usuarios"
                subtitulo="Aqui puedes manejar tus usuarios"
            />

            <div className="contenedor-tabla">
                <div className="header-tabla">

                </div>

                <div className="registros-tabla">
                    <div className="registro"></div>
                    <div className="registro"></div>
                    <div className="registro"></div>
                    <div className="registro"></div>
                    <div className="registro"></div>
                </div>
            </div>
        </div>
    );

}