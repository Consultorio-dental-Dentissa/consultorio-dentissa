import { useState } from "react";


export default function Pacientes() {

    const [pacientes, setPacientess] = useState<object | null>(null)

    return (
        <div>
            <div className="contenedor-titulos-principal">
                <h2>Panel de pacientes</h2>
                <h4>Aqui esta el resumen de tu consultorio dental</h4>
            </div>
        </div>
    );

}