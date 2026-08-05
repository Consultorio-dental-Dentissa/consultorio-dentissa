import { useEffect, useMemo, useState } from "react";
import { PageTitle } from "../../components/shared/page-title.component";
import { Modal } from "@/components/shared/modal.component";
import { Button } from "@/components/ui/button";
import { CreateServiceForm } from "@/features/services/components/create-service-form.component";
import { useServices } from "@/features/services/hooks/use-services";
import { DataTable } from "@/components/shared/data-table.component";
import { SearchInput } from "@/components/shared/input.component";
import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { getServicesColumns } from "@/features/services/components/services-columns.component";
import { Check, X, ClipboardPlus } from "lucide-react";
import type { CreateServiceDto } from "@/features/services/types/create-service.dto";
import toast from "react-hot-toast";

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

    return (
        <div>
            <div className="mt-2 w-full flex justify-between items-end">
                <PageTitle
                    titulo="Panel de servicios"
                    subtitulo="Aqui puedes manejar tus servicios"
                />

                <Button variant="primary" onClick={() => setOpenModal(true)}>Agregar nuevo servicio</Button>
            </div>

            <div className="flex gap-5 mt-5">
                <CardDashboard
                    title="Servicios"
                    icon={ClipboardPlus}
                    data={servicesData.length.toString()}
                />

                <CardDashboard
                    title="Activos"
                    icon={Check}
                    data="0"
                />

                <CardDashboard
                    title="No activos"
                    icon={X}
                    data="0"
                />
            </div>

            <div className="bg-white rounded-xl mt-5 border">
                <div className="p-5 flex items-center justify-between">
                    <div className="w-[30%]">
                        <SearchInput placeholder="Buscar por nombre, correo o telefono" />
                    </div>

                    <p className="text-neutral-400 text-sm font-semibold">
                        {servicesData.length === 1 ? `${servicesData.length} servicio` : `${servicesData.length} servicios`}
                    </p>
                </div>

                {
                    isLoadingTable ? (
                        <div className="bg-white w-full rounded-md p-5 flex justify-center">
                            Cargando...
                        </div>
                    )

                        :

                        !servicesData.length ? (
                            <div className="bg-white w-full rounded-md p-5 flex justify-center">
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
                    isSaving={isLoading}
                />
            </Modal>
        </div>
    );

}