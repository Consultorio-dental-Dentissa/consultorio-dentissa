import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { PageTitle } from "../../components/common/page-title.component";
import { Modal } from "@/components/common/modal.component";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CreateServiceForm } from "@/components/services/create-service-form.component";
import { useServices } from "../../hooks/use-services";
import type { CreateServiceDto } from "@/types/api/request/create-service.dto";
import { DataTable } from "@/components/common/data-table.component";
import { getServicesColumns } from "@/components/services/services-columns.component";


export default function ServicesPage() {

    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { servicesData, useGetAllServices, useCreateService, useUpdateServiceStatus, error } = useServices();

    useEffect(() => {
        setIsLoadingTable(true); 
        useGetAllServices();
        setIsLoadingTable(false);
    }, []);

    useEffect(() => {
        error && toast.error(error);
    }, [error]);

    const handleUpdateServiceStatus = async (id: number, newStatus: boolean) => {

        const isStatusUpdated = await useUpdateServiceStatus(id, newStatus);
        if (isStatusUpdated) {
            toast.success('El estado del servicio se ha actualizado correctamente');
        }
    }

    const handleNewService = async (newService: CreateServiceDto): Promise<void> => {

        const service = await useCreateService(newService);
        if (service) {
            setOpenModal(false);
            toast.success(`El servicio llamado ${service.name} ha sido agregado`);
        }
    }

    const updateServiceStatus = async (serviceId: number, status: boolean) => {
        const isStatusUpdated = await useUpdateServiceStatus(serviceId, status);
        if (isStatusUpdated) {
            toast.success('El estado se ha actualizado correctamente');
        }
    }

    const servicesTableColumns = useMemo(() => getServicesColumns(updateServiceStatus), []);

    return (
        <div>
            <div className="mt-2 w-full flex justify-between items-end">
                <PageTitle
                    titulo="Panel de servicios"
                    subtitulo="Aqui puedes manejar tus servicios"
                />

                <Button variant="primary" onClick={() => setOpenModal(true)}>Agregar nuevo servicio</Button>
            </div>

            <div className="w-full mt-5">

                {
                    isLoadingTable ? (
                        <div>
                            Cargando...
                        </div>
                    )

                    : 

                    !servicesData.length ? (
                        <div>
                            No hay servicios.
                        </div>
                    )

                    :

                    <div className="bg-white rounded-md">
                        <DataTable 
                        columns={servicesTableColumns}
                        data={servicesData}
                        />
                    </div>
                }

            </div>

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