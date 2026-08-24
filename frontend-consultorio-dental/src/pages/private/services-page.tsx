import { PageTitle } from "@/components/shared/page-title.component";
import { useServices } from "@/features/services/hooks/use-services";
import { SearchInput } from "@/components/shared/input.component";
import { CardDashboard } from "@/components/shared/card-dashboard.component";
import { SelectActiveStatus } from "@/components/shared/select-active-status.component";
import { Check, X, ClipboardPlus } from "lucide-react";
import { ServicesTable } from "@/features/services/components/services-table.component";
import { CreateServiceModal } from "@/features/services/components/create-service-modal.component";
import { useState } from "react";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";

export default function ServicesPage() {

    const [status, setStatus] = useState<string | null>(null);
    const { search, setSearch, debouncedSearch } = useDebouncedSearch();

    const services = useServices();
    
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

                <CreateServiceModal />
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
                    <div className="flex flex-row gap-2">
                        <SelectActiveStatus value={status} onChange={setStatus} />
                        <SearchInput
                            placeholder="Buscar por nombre o precio"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <p className="text-neutral-400 text-sm font-semibold">
                        {totalServices} {totalServices != 1 ? 'servicios' : 'servicio'}
                    </p>
                </div>

                <div className={`flex justify-center ${(!totalServices || services.isLoading) && 'p-5'}`}>
                    <ServicesTable
                        filters={{
                            status: status ?? undefined,
                            search: debouncedSearch
                        }}
                    />
                </div>
            </div>
        </div>
    );

}