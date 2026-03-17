import { useState } from "react";


export default function Usuarios() {

    const [usuarios, setUsuarios] = useState<object | null>(null)

    return (
        <div>
            <div className="contenedor-titulos-principal">
                <h2>Panel de usuarios</h2>
                <h4>Aqui esta el resumen de tu consultorio dental</h4>
            </div>
        </div>
    );

}