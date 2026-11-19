import { Phone, TriangleAlert, User } from "lucide-react";
import { Alert } from "@/components/shared/alert.component";
import { InfoCard } from "@/components/shared/info-card.component";
import { InfoRow } from "@/components/shared/info-row.component";
import { calculateAge, formatDate, formatMonthYear, formatPhone } from "@/utils/formatters";
import { capitalize } from "@/utils/clinic-time";
import type { Patient } from "@/features/patients/types/patient.model";

/**
 * Tarjetas "Información personal / Contacto / Emergencia" (Perfil de paciente.dc.html, Paciente - Mi perfil.dc.html).
 * Con ficha reducida (`reduced`, rol ASISTENTE) el backend omite nacimiento, dirección y emergencia: solo se
 * muestran los datos de contacto. Se indica por rol, nunca se deduce de datos nulos (un paciente puede no tenerlos).
 */
export function PatientPersonalData({
    patient, memberSince, reduced = false,
}: { patient: Patient; memberSince?: Date; reduced?: boolean }) {
    const isReduced = reduced;
    const age = calculateAge(patient.birth_date);

    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
                <InfoCard title="Información personal" icon={User}>
                    <InfoRow label="Nombre completo" value={`${patient.name} ${patient.lastname}`} />
                    {!isReduced && (
                        <InfoRow
                            label="Fecha de nacimiento"
                            value={patient.birth_date ? `${formatDate(patient.birth_date)}${age !== null ? ` (${age} años)` : ""}` : null}
                        />
                    )}
                    {memberSince && <InfoRow label="Paciente desde" value={capitalize(formatMonthYear(memberSince))} />}
                </InfoCard>

                <InfoCard title="Contacto" icon={Phone}>
                    <InfoRow label="Teléfono" value={formatPhone(patient.phone)} />
                    <InfoRow label="Correo electrónico" value={patient.email} />
                    {!isReduced && <InfoRow label="Dirección" value={patient.address} />}
                </InfoCard>

                {!isReduced && (
                    <InfoCard title="Emergencia" icon={TriangleAlert}>
                        <InfoRow
                            label="Teléfono de emergencia"
                            value={patient.emergency_phone ? formatPhone(patient.emergency_phone) : null}
                        />
                    </InfoCard>
                )}
            </div>
            {isReduced && (
                <Alert variant="info">Tu rol solo permite ver los datos de contacto del paciente.</Alert>
            )}
        </div>
    );
}
