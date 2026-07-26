import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { PageTitle } from "../../components/common/page-title.component";
import { Modal } from "@/components/common/modal.component";
import { Button } from "@/components/ui/button";
import { CreateServiceForm } from "@/components/services/create-service-form.component";
import { useServices } from "../../hooks/use-services";
import type { CreateServiceDto } from "@/types/api/request/create-service.dto";
import { DataTable } from "@/components/common/data-table.component";
import { getServicesColumns } from "@/components/services/services-columns.component";
import { CardDashboard } from "@/components/dashboard/card-dashboard.component";
import { Stethoscope } from "lucide-react";


export default function ServicesPage() {

    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);

    const { 
        servicesData, 
        useGetAllServices, 
        useCreateService, 
        useUpdateServiceStatus, 
        isLoading, 
        error 
    } = useServices();

    useEffect(() => {
        setIsLoadingTable(true); 
        useGetAllServices().
        finally(() => setIsLoadingTable(false));
    }, []);

    useEffect(() => {
        error && toast.error(error);
    }, [error]);


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

    const servicesCount = useMemo(() => ({
        total: servicesData.length,
        active: servicesData.filter(s => s.status === true).length,
        inactive: servicesData.filter(s => s.status === false).length,
    }), [servicesData]);

    return (
        <div>
            <div className="mt-2 w-full flex justify-between items-end">
                <PageTitle
                    titulo="Panel de servicios"
                    subtitulo="Aqui puedes manejar tus servicios"
                />

                <Button variant="primary" onClick={() => setOpenModal(true)}>Agregar nuevo servicio</Button>
            </div>

            <div className="flex w-full gap-3 mt-5">
                <CardDashboard
                    title="Servicios totales"
                    icon={Stethoscope}
                    data={servicesCount.total.toString()}
                />

                <CardDashboard
                    title="Servicios activos"
                    icon={Stethoscope}
                    data={servicesCount.active.toString()}
                />

                <CardDashboard
                    title="Servicios no activos"
                    icon={Stethoscope}
                    data={servicesCount.inactive.toString()}
                />
            </div>

            <div className="bg-white rounded-xl mt-5 border">
                {
                    isLoadingTable ?
                        (
                            <div className="bg-white rounded-lg p-5 flex justify-center">
                                <h2>Cargando...</h2>
                            </div>
                        )
                        :
                        !servicesData.length ?
                            (
                                <div className="bg-white rounded-sm p-5 flex justify-center">
                                    <h2>No se encontrarón servicios.</h2>
                                </div>
                            )
                            :
                            (
                                <div>
                                    <div className="p-5 flex justify-between">
                                        <div className="w-full flex gap-1">
                                            <h2 className="font-bold text-lg">Servicios</h2>
                                        </div>

                                        <div className="w-full flex justify-end text-gray-500 text-sm font-medium">
                                            {servicesData.length === 1 ? `${servicesData.length} servicio` : `${servicesData.length} servicios`}
                                        </div>
                                    </div>

                                    <DataTable
                                        columns={servicesTableColumns}
                                        data={servicesData}
                                    />
                                </div>
                            )
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
                        isSaving={isLoading}
                    />            
            </Modal>
        </div>
    );

}