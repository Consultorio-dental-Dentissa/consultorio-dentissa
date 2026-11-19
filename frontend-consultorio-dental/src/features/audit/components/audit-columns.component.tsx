import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auditActionLabel, auditEntityLabel } from "@/features/audit/types/audit.labels";
import { formatClinicDateTime } from "@/utils/clinic-time";
import type { AuditLog } from "@/features/audit/types/audit.model";

/** Columnas de la tabla de auditoría (solo lectura): fecha, acción, entidad, usuario y detalle. */
export function getAuditColumns(onView: (log: AuditLog) => void): ColumnDef<AuditLog>[] {
    return [
        {
            id: "date",
            header: "Fecha",
            cell: ({ row }) => <span className="text-[15px] whitespace-nowrap text-ink-2">{formatClinicDateTime(row.original.created_at)}</span>,
        },
        {
            id: "action",
            header: "Acción",
            cell: ({ row }) => <Badge variant="default">{auditActionLabel(row.original.action)}</Badge>,
        },
        {
            id: "entity",
            header: "Entidad",
            cell: ({ row }) => (
                <span className="text-[15px] text-ink-2">
                    {auditEntityLabel(row.original.entity)}
                    {row.original.entity_id !== null && <span className="text-ink-4"> #{row.original.entity_id}</span>}
                </span>
            ),
        },
        {
            id: "user",
            header: "Usuario",
            cell: ({ row }) =>
                row.original.user ? (
                    <span className="text-[15.5px] font-bold">{row.original.user.name} {row.original.user.lastname}</span>
                ) : (
                    <span className="text-[15px] text-ink-4">Sistema</span>
                ),
        },
        {
            id: "actions",
            header: () => <span className="block text-right">Detalle</span>,
            meta: { className: "w-[90px]" },
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="secondary" size="icon-sm" onClick={() => onView(row.original)}
                        aria-label={`Ver detalle: ${auditActionLabel(row.original.action)}, registro ${row.original.id}`} title="Ver detalle"
                    >
                        <Eye />
                    </Button>
                </div>
            ),
        },
    ];
}
