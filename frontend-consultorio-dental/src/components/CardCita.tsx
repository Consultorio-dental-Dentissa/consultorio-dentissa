// components/citas/CardCita.tsx
import type { RespuestaCita } from '../types/respuestas/RespuestaCita';

interface PropsCardCita {
    cita: RespuestaCita;
}

interface PropsCardVacia {
    registro: string
}


export function CardCita({ cita }: PropsCardCita) {
    return (
        <div className={`card-cita ${cita.estado}`}>
            <div className='seccion-hora'>
                <h3>9:00</h3>
                <h4>10:00</h4>
            </div>

            <div className='seccion-info'>
                <h2 className='nombre-paciente'>{`${cita.paciente.nombre} ${cita.paciente.apellido}`}</h2>
                <h3 className='nombre-servicio'>{cita.servicio.nombre}</h3>

                <div className='contenedor-tiempo-y-estado'>
                    <p>{`${cita.duracion_minutos} min`}</p>
                    <span className={`span-estado ${cita.estado}`}>
                        {cita.estado}
                    </span>

                    <div className='contenedor-botones'>
                        <button>Ver cita</button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export function CardCitaVacia({ registro }: PropsCardVacia) {
    return (
        <div className='card-cita-vacia'>
            <h2>No hay {registro}</h2>
        </div>
    );
}