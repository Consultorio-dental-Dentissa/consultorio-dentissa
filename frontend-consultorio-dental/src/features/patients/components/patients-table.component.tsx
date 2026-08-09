import { DataTable } from "@/components/shared/data-table.component"
import { getPatientsColumns } from "./patients-columns.component"
import { usePatients } from "../hooks/use-patients";
import { Spinner } from "@/components/ui/spinner";

export function PatientsTable() {

    const patiens = usePatients();
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