import { useMemo, useState } from "react";
import { PageTitle } from "../../components/shared/page-title.component";
import { Modal } from "@/components/shared/modal.component";
import { Button } from "@/components/ui/button";
import { CreateServiceForm } from "@/features/services/components/create-service-form.component";
import { useCreateService, useServices } from "@/features/services/hooks/use-services";
import { SearchInput } from "@/components/shared/input.component";
import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { Check, X, ClipboardPlus } from "lucide-react";
import { ServicesTable } from "@/features/services/components/services-table.component";
import type { CreateServiceDto } from "@/features/services/types/create-service.dto";
import toast from "react-hot-toast";

export default function ServicesPage() {

    const [openModal, setOpenModal] = useState(false);

    const services = useServices();
    const createServiceMutation = useCreateService();

    const handleNewService = async (newService: CreateServiceDto): Promise<void> => {
        createServiceMutation.mutate(newService, {
            onSuccess: () => {
                toast.success('Se registró un nuevo servicio');
                setOpenModal(false);
            },
            onError: (error) => toast.error(error.message),
        });
    }  
    
    const totalServices = services.data ? services.data.length : 0;
    const activeServices = services.data ? services.data.filter(s => s.status).length : 0;
    const inactiveServices = services.data ? services.data.filter(s => !s.status).length : 0;
    
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
                    data={totalServices.toString()}
                />

                <CardDashboard
                    title="Activos"
                    icon={Check}
                    data={activeServices.toString()}
                />

                <CardDashboard
                    title="No activos"
                    icon={X}
                    data={inactiveServices.toString()}
                />
            </div>

            <div className="bg-white rounded-xl mt-5 border">
                <div className="p-5 flex items-center justify-between">
                    <div className="w-[30%]">
                        <SearchInput placeholder="Buscar por nombre, correo o telefono" />
                    </div>

                    <p className="text-neutral-400 text-sm font-semibold">
                        {totalServices} {totalServices != 1 ? 'servicios' : 'servicio'}
                    </p>
                </div>

                <div className={`flex justify-center ${(!totalServices || services.isLoading) && 'p-5'}`}>
                    <ServicesTable />
                </div>
            </div>

            <Modal
                title="Registrar Servicio"
                description="Por favor llene todos los campos del servicio"
                open={openModal}
                onClose={() => setOpenModal(false)}
            >
                <CreateServiceForm
                    onSubmit={handleNewService}
                    onCancel={() => setOpenModal(false)}
                    isSaving={createServiceMutation.isPending}
                />
            </Modal>
        </div>
    );

}