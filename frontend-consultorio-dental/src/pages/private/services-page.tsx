import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useServices } from "../../hooks/use-services";

import EmptyTable from "../../components/common/empty-table.component";
import { PageTitle } from "../../components/common/page-title.component";
import { CreateServiceModal } from "@/components/services/create-service-modal.component";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import type { CreateServiceDto } from "@/types/api/request/create-service.dto";
import type { Service } from "@/types/models/service";

export default function ServicesPage() {

    const [services, setServices] = useState<Service[]>([]);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { getServices, createService, updateServiceStatus, loadingTable } = useServices();

    useEffect(() => {

        async function fetchServices() {

            try {
                const services = await getServices();
                setServices(services);
            } catch (error) {
                toast.error((error as string));
            }
        }

        fetchServices();
    }, []);

    const handleUpdateServiceStatus = async (id: number, newStatus: boolean) => {

        try {
            const response = await updateServiceStatus(id, newStatus);
            console.log(response);
            setServices(prev => prev.map((service) => service.id === id ? { ...service, status: newStatus } : service))
            toast.success('Se ha cambiado el estado del servicio');

        } catch (error) {
            toast.error((error as string));
        }
    }

    const handleNewService = async (newService: CreateServiceDto): Promise<void> => {

        try {
            const service = await createService(newService);
            setServices(prev => [...prev, service]);
            setOpenModal(false);
            toast.success('Se ha registrado un nuevo servicio exitosamente');

        } catch (error) {
            toast.error((error as string));
        }
    }

    function totalMinutesToHours(minutes: number): string {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    return (
        <div>
            <div className="mt-2 w-full flex justify-between items-end">
                <PageTitle
                    titulo="Panel de servicios"
                    subtitulo="Aqui puedes manejar tus servicios"
                />

                <Button variant="primary" onClick={() => setOpenModal(true)}>Agregar nuevo servicio</Button>
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
                            <EmptyTable
                                mensaje="Buscando servicios..."
                                submensaje="Estamos buscando los servicios"
                            />
                        ) : services.length === 0 ? (
                            <EmptyTable
                                mensaje="No hay servicios"
                                submensaje="No se han encontrado servicios. Por favor, agrega uno nuevo"
                            />
                        ) : (
                            services.map((servicio) => {
                                return (
                                    <tr key={servicio.id}>
                                        <td>{servicio.name}</td>
                                        <td>${parseFloat(servicio.price).toFixed(2)}</td>
                                        <td>{totalMinutesToHours(servicio.durationMinutes)}</td>
                                        <td>{servicio.description}</td>
                                        <td>
                                            <Switch checked={servicio.status} onClick={() => handleUpdateServiceStatus(servicio.id, !servicio.status)}/>
                                        </td>
                                    </tr>
                                )
                            })
                        )
                    }

                </tbody>
            </table>

            {
                <CreateServiceModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onSubmit={handleNewService}
                />
            }
        </div>
    );

}