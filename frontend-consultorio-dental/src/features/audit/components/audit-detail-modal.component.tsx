import { ScrollText } from "lucide-react";
import { Modal } from "@/components/shared/modal.component";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auditActionLabel, auditEntityLabel } from "@/features/audit/types/audit.labels";
import { formatClinicDateTime } from "@/utils/clinic-time";
import type { AuditLog } from "@/features/audit/types/audit.model";

function display(value: unknown): string {
    if (value === undefined) return "—";
    if (value === null) return "null";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return JSON.stringify(value);
}

/** Detalle de un registro: quién, cuándo y los valores antes/después (solo lectura). */
export function AuditDetailModal({ log, onClose }: { log: AuditLog | null; onClose: () => void }) {
    const keys = log
        ? [...new Set([...Object.keys(log.before ?? {}), ...Object.keys(log.after ?? {})])]
        : [];

    return (
        <Modal
            icon={ScrollText}
            open={log !== null}
            onClose={(open) => !open && onClose()}
            title={log ? auditActionLabel(log.action) : "Detalle del registro"}
            description={log ? `Registro de auditoría #${log.id}` : undefined}
            size="lg"
        >
            {log && (
                <div className="flex flex-col gap-4">
                    <dl className="grid gap-3 rounded-[10px] border border-line-soft bg-surface-muted p-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-extrabold tracking-[0.05em] text-ink-4 uppercase">Fecha</dt>
                            <dd className="mt-1 text-[15px] font-bold">{formatClinicDateTime(log.created_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-extrabold tracking-[0.05em] text-ink-4 uppercase">Usuario</dt>
                            <dd className="mt-1 text-[15px] font-bold">{log.user ? `${log.user.name} ${log.user.lastname}` : "Sistema"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-extrabold tracking-[0.05em] text-ink-4 uppercase">Entidad</dt>
                            <dd className="mt-1 text-[15px] font-bold">{auditEntityLabel(log.entity)}{log.entity_id !== null && ` #${log.entity_id}`}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-extrabold tracking-[0.05em] text-ink-4 uppercase">Acción</dt>
                            <dd className="mt-1 font-mono text-[13.5px] font-bold">{log.action}</dd>
                        </div>
                    </dl>

                    {keys.length === 0 ? (
                        <p className="text-[15px] text-ink-4">Este registro no guardó valores antes ni después.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-[10px] border border-line">
                            <table className="w-full text-left text-[14px]">
                                <caption className="sr-only">Valores antes y después del cambio</caption>
                                <thead className="bg-surface-muted">
                                    <tr>
                                        <th scope="col" className="px-3 py-2.5 text-[13.5px] font-bold text-ink-4">Campo</th>
                                        <th scope="col" className="px-3 py-2.5 text-[13.5px] font-bold text-ink-4">Antes</th>
                                        <th scope="col" className="px-3 py-2.5 text-[13.5px] font-bold text-ink-4">Después</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keys.map((key) => {
                                        const before = log.before?.[key];
                                        const after = log.after?.[key];
                                        const changed = JSON.stringify(before) !== JSON.stringify(after);

                                        return (
                                            <tr key={key} className="border-t border-line-row align-top">
                                                <th scope="row" className="px-3 py-2 font-mono text-[13px] font-bold text-ink-3">{key}</th>
                                                <td className={cn("px-3 py-2 font-medium break-words", changed ? "bg-danger-soft text-destructive" : "text-ink-3")}>{display(before)}</td>
                                                <td className={cn("px-3 py-2 font-medium break-words", changed ? "bg-success-soft text-success" : "text-ink-3")}>{display(after)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="form-footer">
                        <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
