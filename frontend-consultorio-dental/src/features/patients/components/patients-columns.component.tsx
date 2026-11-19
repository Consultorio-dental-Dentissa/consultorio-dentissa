import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ActiveBadge } from "@/components/shared/status-badge.component";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPhone } from "@/utils/formatters";
import type { Patient } from "@/features/patients/types/patient.model";

/** Columnas de Pacientes.dc.html: Nombre (con correo), Teléfono, Próxima cita, Estatus y Acciones. */
export function getPatientsColumns(): ColumnDef<Patient>[] {
    return [
        {
            id: "patient",
            header: "Nombre",
            cell: ({ row }) => (
                <div className="min-w-0">
                    <p className="truncate text-[15.5px] font-bold">{row.original.name} {row.original.lastname}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-4">{row.original.email}</p>
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: "Teléfono",
            cell: ({ row }) => <span className="text-ink-2">{formatPhone(row.original.phone)}</span>,
        },
        {
            id: "next_appointment",
            header: "Próxima cita",
            cell: ({ row }) => (
                <span className="text-ink-2">
                    {row.original.next_appointment_at ? formatDateTime(row.original.next_appointment_at) : "—"}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Estatus",
            cell: ({ row }) => <ActiveBadge active={row.original.status} />,
        },
        {
            id: "profile",
            header: () => <span className="block text-right">Acciones</span>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button asChild variant="secondary" size="sm">
                        <Link
                            to={`/pacientes/${row.original.id}`}
                            aria-label={`Ver perfil de ${row.original.name} ${row.original.lastname}`}
                        >
                            Ver perfil
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];
}
