import { useEffect, useState } from "react";
import { TituloPanel } from "../../components/TituloPanel";
import { useServicios } from "../../hooks/useServicios";
import type { RespuestaServicio } from "../../types/respuestas/RespuestaServicio";
import TablaVacia from "../../components/tablaVacia";
import { ToggleButton } from "../../components/ToggleButton";
import toast from "react-hot-toast";
import ServicioForm from "../../components/ServicioForm";

export default function Servicios() {

    const [servicios, setServicios] = useState<RespuestaServicio[]>([]);
    const [modalAbierto, setModalAbierto] = useState<boolean>(false);
    const { obtenerServicios, cambiarEstadoServicio, loading, error } = useServicios();

    useEffect(() => {

        async function cargarServicios() {
            const servicios = await obtenerServicios();
            servicios && setServicios(servicios);
        }

        cargarServicios();
    }, []);

    const cambiarEstadoDelServicio = async (id: number, nuevoEstado: boolean) => {
        const respuesta = await cambiarEstadoServicio(id, nuevoEstado);

        // Actualizar el estado
        if (respuesta) {
            setServicios(prev => prev.map((servicio) => servicio.id === id ? { ...servicio, activo: nuevoEstado } : servicio))
            toast.success('Se ha cambiado el estado del servicio');
        } 
        
        error && toast.error(error);
    }

    const manejarNuevoServicio = (nuevoServicio: RespuestaServicio) => {
        setServicios(prev => [...prev, nuevoServicio]);
        setModalAbierto(false);
        toast.success('Se ha registrado un nuevo servicio exitosamente');
    }

    function minutosAHoras(minutos: number): string {
        const horas = Math.floor(minutos / 60)
        const mins = minutos % 60
        return `${horas}h ${mins}m`
    }

    return (
        <div>
            <TituloPanel
                titulo="Panel de servicios"
                subtitulo="Aqui puedes manejar tus servicios"
            />

            <div className="contenedor-btn-registrar">
                <button className="btn-registrar" onClick={() => {
                    setModalAbierto(true)
                }}>Registrar nuevo servicio</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Duración</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>

                    {
                        loading ? (
                            <TablaVacia
                                mensaje="Buscando servicios..."
                                submensaje="Estamos buscando los servicios"
                            />
                        ) : servicios.length === 0 ? (
                            <TablaVacia
                                mensaje="No hay servicios"
                                submensaje="No se han encontrado servicios. Por favor, agrega uno nuevo"
                            />
                        ) : (
                            servicios.map((servicio) => {
                                return (
                                    <tr key={servicio.id}>
                                        <td>{servicio.nombre}</td>
                                        <td>${parseFloat(servicio.precio).toFixed(2)}</td>
                                        <td>{minutosAHoras(servicio.duracion_minutos)}</td>
                                        <td>{servicio.descripcion}</td>
                                        <td>
                                            <ToggleButton
                                                estado={servicio.activo}
                                                onChange={(nuevoEstado) => cambiarEstadoDelServicio(servicio.id, nuevoEstado)}
                                            />
                                        </td>
                                    </tr>
                                )
                            })
                        )
                    }

                </tbody>
            </table>

            {
                modalAbierto &&
                <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <ServicioForm
                            onSubmit={manejarNuevoServicio}
                            onCancel={() => setModalAbierto(false)}
                        />
                    </div>
                </div>
            }
        </div>
    );

}