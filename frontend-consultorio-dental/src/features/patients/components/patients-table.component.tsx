import { DataTable } from "@/components/shared/data-table.component"
import { getPatientsColumns } from "./patients-columns.component"
import { usePatients } from "../hooks/use-patients";
import { Spinner } from "@/components/ui/spinner";
import type { PatientFilters } from "@/features/patients/types/patient.filters";

export function PatientsTable({ filters }: { filters?: PatientFilters }) {

    const patiens = usePatients(filters);
    const columns = getPatientsColumns();

    if (patiens.isLoading) {
        return <Spinner />
    }

    if (!patiens.data || !patiens.data.length) {
        return <p>No se encontraron pacientes.</p>
    }
    
    return (
        <DataTable 
            columns={columns}
            data={patiens.data}
        />
    )
}