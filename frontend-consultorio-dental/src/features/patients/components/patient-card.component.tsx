import { Link } from "react-router-dom";
import { ActiveBadge } from "@/components/shared/status-badge.component";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPhone } from "@/utils/formatters";
import type { Patient } from "@/features/patients/types/patient.model";

/** Versión en tarjeta de una fila del directorio de pacientes para pantallas pequeñas. */
export function PatientCard({ patient }: { patient: Patient }) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[15.5px] font-bold">{patient.name} {patient.lastname}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-4">{patient.email}</p>
                    <p className="mt-1 text-[15px] text-ink-2">{formatPhone(patient.phone)}</p>
                </div>
                <ActiveBadge active={patient.status} />
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-line-row pt-3">
                <p className="text-sm text-ink-4">
                    Próxima cita: {patient.next_appointment_at ? formatDateTime(patient.next_appointment_at) : "—"}
                </p>
                <Button asChild variant="secondary" size="sm">
                    <Link to={`/pacientes/${patient.id}`} aria-label={`Ver perfil de ${patient.name} ${patient.lastname}`}>
                        Ver perfil
                    </Link>
                </Button>
            </div>
        </div>
    );
}
