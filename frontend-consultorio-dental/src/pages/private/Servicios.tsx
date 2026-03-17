import { useState } from "react";


export default function Servicios() {

    const [servicios, setServicios] = useState<object | null>(null)

    return (
        <div>
            <div className="contenedor-titulos-principal">
                <h2>Panel de servicios</h2>
                <h4>Aqui esta el resumen de tu consultorio dental</h4>
            </div>
        </div>
    );

}