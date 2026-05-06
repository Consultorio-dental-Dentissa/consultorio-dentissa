import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { PageTitle } from "../../components/common/page-title.component";
import { Modal } from "@/components/common/modal.component";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CreateServiceForm } from "@/components/services/create-service-form.component";
import { useServices } from "../../hooks/use-services";
import type { CreateServiceDto } from "@/types/api/request/create-service.dto";

export default function ServicesPage() {

    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { servicesData, getServices, createService, updateServiceStatus, error } = useServices();

    useEffect(() => {
        setIsLoadingTable(true); 
        getServices().finally(() => setIsLoadingTable(false));
    }, []);

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    const handleUpdateServiceStatus = async (id: number, newStatus: boolean) => {

        const isStatusUpdated = await updateServiceStatus(id, newStatus);
        if (isStatusUpdated) {
            toast.success('El estado del servicio se ha actualizado correctamente');
        }
    }

    const handleNewService = async (newService: CreateServiceDto): Promise<void> => {

        const service = await createService(newService);
        if (service) {
            setOpenModal(false);
            toast.success(`El servicio llamado ${service.name} ha sido agregado`);
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

            <table className="w-full">
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
                        isLoadingTable ? 
                        (
                            <tr className="bg-white rounded-sm p-5 flex justify-center">
                                <h2>Cargando...</h2>
                            </tr>
                        ) 
                        :
                        servicesData.length === 0 ? 
                        (
                            <tr className="bg-white rounded-sm p-5 flex justify-center">
                                <td>No se encontrarón servicios</td>
                            </tr>
                        ) 
                        : 
                        (
                            servicesData.map((servicio) => {
                                return (
                                    <tr key={servicio.id}>
                                        <td>{servicio.name}</td>
                                        <td>${parseFloat(servicio.price).toFixed(2)}</td>
                                        <td>{totalMinutesToHours(servicio.durationMinutes)}</td>
                                        <td>{servicio.description}</td>
                                        <td>
                                            <Switch 
                                                checked={servicio.status} 
                                                onClick={
                                                    () => handleUpdateServiceStatus(
                                                            servicio.id, 
                                                            !servicio.status
                                                        )
                                                }
                                            />
                                        </td>
                                    </tr>
                                )
                            })
                        )
                    }
                </tbody>
            </table>

            <Modal
                title="Registrar nuevo servicio"
                description="Por favor llene todos los campos del servicio"
                open={openModal}
                onClose={() => setOpenModal(false)}
                >
                    <CreateServiceForm
                        onSubmit={handleNewService}
                        onCancel={() => setOpenModal(false)}
                    />            
            </Modal>
        </div>
    );

}