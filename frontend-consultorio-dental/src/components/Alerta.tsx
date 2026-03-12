import { MdError } from "react-icons/md";
import { BiSolidError } from "react-icons/bi";
import { GrStatusGood } from "react-icons/gr";

export type Props = {
  tipo: "error" | "exito" | "warning";
  mensaje: string;
};

export function Alerta({tipo, mensaje}: Props) {

    let alerta = '';
    let icono;

    switch(tipo) {
        case 'exito':
            alerta = 'alerta-exito';
            icono = <GrStatusGood className="icon-exito" />
            break;
        case 'error':
            alerta = 'alerta-error';
            icono = <MdError className="icon-error" />
            break;
        case 'warning':
            alerta = 'alerta-warning';
            icono = <BiSolidError className="icon-warning" />
            break;   
    }

    return (
        <div className={`alerta ${alerta}`}>
            <div className="contenedor-icon-alerta">
                {icono}
            </div>
            <h3>{mensaje}</h3>
        </div>
    );

}