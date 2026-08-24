import { DataTable } from "@/components/shared/data-table.component";
import { useServices } from "../hooks/use-services";
import { getServicesColumns } from "./services-columns.component";
import { Spinner } from "@/components/ui/spinner";
import { useMemo } from "react";
import type { ServiceFilters } from "@/features/services/types/service.filters";


export function ServicesTable({ filters }: { filters?: ServiceFilters }) {

    const services = useServices(filters);
    const columns = useMemo(() => getServicesColumns(), []);


    if (services.isLoading) {
        return <Spinner />
    }

    if (!services.data?.length) {
        return <p>No se encontraron servicios</p>
    }

    return (
        <DataTable 
            columns={columns}
            data={services.data}
        />
    )
}