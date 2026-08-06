import { DataTable } from "@/components/shared/data-table.component"
import { getUsersTableColumns } from "./users-colums.component"
import { useUsers } from "@/features/users/hooks/use-users"
import { Spinner } from "@/components/ui/spinner";
import { useMemo } from "react";

export function UsersTable() {

    const users = useUsers();
    const columns = useMemo(() => getUsersTableColumns(), [])

    if (users.isLoading) return <Spinner />

    if (!users.data) return <p>No se encontraron usuarios</p>

    return (
        <DataTable
            columns={columns}
            data={users.data}
        />
    )
}