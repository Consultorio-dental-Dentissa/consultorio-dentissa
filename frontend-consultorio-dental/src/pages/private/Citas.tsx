import { useEffect, useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";
import type { RespuestaCita } from "../../types/respuestas/RespuestaCita";
import { useCitas } from "../../hooks/useCitas";
import { CardCita, CardCitaVacia } from "../../components/CardCita";
import CitaForm from "../../components/CitaForm";

export default function Citas() {

    const [citas, setCitas] = useState<RespuestaCita[]>([]);
    const [modalAbierto, setModalAbierto] = useState<boolean>(false);
    const { obtenerCitas, cargando } = useCitas();

    useEffect(() => {

        async function cargarCitas() {
            const citas = await obtenerCitas();
            if (citas) setCitas(citas);
        }

        cargarCitas();
    }, []);


    function agruparPorFecha(citas: RespuestaCita[]) {
        return citas.reduce((grupos, cita) => {
            const fecha = String(cita.fecha).slice(0, 10); // "2026-03-23"
            if (!grupos[fecha]) grupos[fecha] = [];
            grupos[fecha].push(cita);
            return grupos;
        }, {} as Record<string, RespuestaCita[]>);
    }

    const manejarNuevaCita = (nuevaCita: RespuestaCita) => {
        setCitas(prev => [...prev, nuevaCita]);
        setModalAbierto(false);
    }

    const grupos = agruparPorFecha(citas);
    const fechas = Object.keys(grupos).sort();

    console.log(citas);

    return (
        <div>
            <TituloPanel
                titulo="Panel de citas"
                subtitulo="Aqui puedes manejar tus citas"
            />

            <div className="contenedor-btn-registrar">
                <button className="btn-registrar" onClick={() => { setModalAbierto(true) }}>Agendar cita</button>
            </div>

            <div className="contenedor-citas" style={{ marginTop: '20px' }}>

                {cargando && <p style={{ color: 'black' }}>Cargando...</p>}

                {!cargando && citas.length === 0 && <CardCitaVacia registro="citas" />}

                {!cargando && fechas.map(fecha => (
                    <div key={fecha} className="grupo-fecha">
                        <h3>{fecha}</h3>
                        {grupos[fecha].map(cita => (
                            <CardCita key={cita.id} cita={cita} />
                        ))}
                    </div>
                ))}

            </div>


            { /* Abrir modal */}


            {
                modalAbierto && (
                    <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <CitaForm
                                onSubmit={manejarNuevaCita}
                                onCancel={() => {setModalAbierto(false)}}
                            />
                        </div>
                    </div>
                )
            }

        </div >
    );

}