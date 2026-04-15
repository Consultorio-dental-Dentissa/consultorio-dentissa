import { useEffect, useState } from "react";
import { TituloPanel } from "../../components/common/TituloPanel";
import { useServicios } from "../../hooks/useServicios";
import TablaVacia from "../../components/common/TablaVacia";
import { ToggleButton } from "../../components/common/ToggleButton";
import { ModalCrearServicio } from "@/components/modals/ModalCrearServicio";
import { PrimaryButton } from "@/components/common/Button";
import type { RespuestaServicio } from "../../types/api/responses/RespuestaServicio";
import toast from "react-hot-toast";
import type { CrearServicio } from "@/types/api/request/CrearServicio";

export default function Servicios() {

    const [servicios, setServicios] = useState<RespuestaServicio[]>([]);
    const [modalAbierto, setModalAbierto] = useState<boolean>(false);
    const { obtenerServicios, crearServicio, cambiarEstadoServicio, loadingTable } = useServicios();

    useEffect(() => {

        async function cargarServicios() {

            try {
                const servicios = await obtenerServicios();
                setServicios(servicios);
            } catch (error) {
                toast.error((error as string));
            }
        }

        cargarServicios();
    }, []);

    const cambiarEstadoDelServicio = async (id: number, nuevoEstado: boolean) => {

        try {
            const respuesta = await cambiarEstadoServicio(id, nuevoEstado);
            console.log(respuesta);
            setServicios(prev => prev.map((servicio) => servicio.id === id ? { ...servicio, status: nuevoEstado } : servicio))
            toast.success('Se ha cambiado el estado del servicio');

        } catch (error) {
            toast.error((error as string));
        }
    }

    const manejarNuevoServicio = async (nuevoServicio: CrearServicio): Promise<void> => {

        try {
            const servicio = await crearServicio(nuevoServicio);
            setServicios(prev => [...prev, servicio]);
            setModalAbierto(false);
            toast.success('Se ha registrado un nuevo servicio exitosamente');

        } catch (error) {
            toast.error((error as string));
        }
    }

    function minutosAHoras(minutos: number): string {
        const horas = Math.floor(minutos / 60)
        const mins = minutos % 60
        return `${horas}h ${mins}m`
    }

    return (
        <div>
            <div className="mt-2 w-full flex justify-between items-end">
                <TituloPanel
                    titulo="Panel de servicios"
                    subtitulo="Aqui puedes manejar tus servicios"
                />

                <PrimaryButton
                    message="Registrar nuevo servicio"
                    onClick={() => { setModalAbierto(true) }}
                />
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
                        loadingTable ? (
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
                                        <td>{servicio.name}</td>
                                        <td>${parseFloat(servicio.price).toFixed(2)}</td>
                                        <td>{minutosAHoras(servicio.durationMinutes)}</td>
                                        <td>{servicio.description}</td>
                                        <td>
                                            <ToggleButton
                                                estado={servicio.status}
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
                <ModalCrearServicio
                    open={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    onSubmit={manejarNuevoServicio}
                />
            }
        </div>
    );

}