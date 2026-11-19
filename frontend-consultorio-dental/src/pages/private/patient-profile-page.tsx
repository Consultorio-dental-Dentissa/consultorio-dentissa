import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableCard } from "@/components/shared/table-card.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { Modal } from "@/components/shared/modal.component";
import { ProfileHero, type ProfileHeroMeta } from "@/components/shared/profile-hero.component";
import { ActiveBadge } from "@/components/shared/status-badge.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
    usePatient, usePatientAppointmentHistory, usePatientConsultationHistory,
} from "@/features/patients/hooks/use-patients";
import { usePatientSummary } from "@/features/patients/hooks/use-patient-summary";
import { PatientQuickStats } from "@/features/patients/components/patient-quick-stats.component";
import { PatientPersonalData } from "@/features/patients/components/patient-personal-data.component";
import { AppointmentHistory, ConsultationHistory } from "@/features/patients/components/patient-history.component";
import { EditPatientForm } from "@/features/patients/components/edit-patient-form.component";
import { CreateAppointmentModal } from "@/features/appointments/components/create-appointment-modal.component";
import { AppointmentWorkflow } from "@/features/appointments/components/appointment-workflow.component";
import { Role } from "@/features/users/types/rol.enum";
import { ApiError } from "@/services/api";
import { ConsultationDetailModal } from "@/features/consultations/components/consultation-detail-modal.component";
import { useDisclosure } from "@/hooks/use-disclosure";
import { calculateAge, formatPhone } from "@/utils/formatters";

const HISTORY_PAGE_SIZE = 8;

const BACK_LINK = "w-fit text-[15px] font-bold text-ink-4 hover:text-foreground";

/**
 * Perfil de paciente.dc.html (ADMIN) y Asistente - Perfil de paciente.dc.html (ASISTENTE).
 * El ASISTENTE no puede ver consultas (el backend responde 403): solo Historial de citas y Datos personales.
 * No hay pestaña de odontograma: no existe en el backend.
 */
export default function PatientProfilePage() {
    const { id } = useParams();
    const patientId = Number(id);
    const validId = Number.isInteger(patientId) && patientId > 0;

    const { user } = useAuth();
    const isAdmin = user?.role === Role.ADMINISTRADOR;

    const [tab, setTab] = useState("appointments");
    const [appointmentsPage, setAppointmentsPage] = useState(1);
    const [consultationsPage, setConsultationsPage] = useState(1);

    const editDialog = useDisclosure();
    const appointmentModal = useDisclosure();
    const [consultationId, setConsultationId] = useState<number | null>(null);
    const [editAppointmentId, setEditAppointmentId] = useState<number | null>(null);

    const patientQuery = usePatient(validId ? patientId : undefined);
    const summary = usePatientSummary(validId ? patientId : undefined);
    const appointmentsQuery = usePatientAppointmentHistory(
        validId && tab === "appointments" ? patientId : undefined,
        { page: appointmentsPage, limit: HISTORY_PAGE_SIZE },
    );
    const consultationsQuery = usePatientConsultationHistory(
        validId ? patientId : undefined,
        { page: consultationsPage, limit: HISTORY_PAGE_SIZE },
        isAdmin && tab === "consultations",
    );

    const backLink = <Link to="/pacientes" className={BACK_LINK}>← Pacientes</Link>;

    if (!validId) {
        return (
            <>
                {backLink}
                <TableCard><ErrorState message="La dirección del paciente no es válida." /></TableCard>
            </>
        );
    }

    if (patientQuery.isPending) {
        return (
            <>
                {backLink}
                <div className="flex items-center gap-8 rounded-xl border border-line bg-surface px-8 py-7" aria-busy="true">
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-[68px] w-72 rounded-xl" />
                </div>
            </>
        );
    }

    if (patientQuery.isError) {
        const notFound = patientQuery.error instanceof ApiError && patientQuery.error.code === "not_found";
        return (
            <>
                {backLink}
                <TableCard>
                    <ErrorState
                        message={notFound ? "El paciente que buscas no existe." : patientQuery.error.message}
                        onRetry={notFound ? undefined : () => patientQuery.refetch()}
                    />
                </TableCard>
            </>
        );
    }

    const patient = patientQuery.data;
    const age = calculateAge(patient.birth_date);
    const meta: ProfileHeroMeta[] = [
        ...(age !== null ? [{ icon: User, text: `${age} años` }] : []),
        { icon: Phone, text: formatPhone(patient.phone) },
        { icon: Mail, text: patient.email },
    ];

    return (
        <>
            {backLink}

            <ProfileHero
                title={`${patient.name} ${patient.lastname}`}
                badge={<ActiveBadge active={patient.status} />}
                meta={meta}
                aside={<PatientQuickStats summary={summary} />}
                actions={
                    <>
                        <Button
                            onClick={appointmentModal.show}
                            disabled={!patient.status}
                            title={patient.status ? undefined : "El paciente está inactivo"}
                        >
                            Agendar cita
                        </Button>
                        {isAdmin && (
                            <Button variant="outline" size="sm" onClick={editDialog.show}>
                                Editar paciente
                            </Button>
                        )}
                    </>
                }
            />

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList aria-label="Secciones del perfil">
                    <TabsTrigger value="appointments">Historial de citas</TabsTrigger>
                    {isAdmin && <TabsTrigger value="consultations">Historial de consultas</TabsTrigger>}
                    <TabsTrigger value="data">Datos personales</TabsTrigger>
                </TabsList>

                <TabsContent value="appointments">
                    <AppointmentHistory
                        query={appointmentsQuery}
                        summary={summary}
                        page={appointmentsPage}
                        onPageChange={setAppointmentsPage}
                        role={user?.role ?? ""}
                        onEditAppointment={setEditAppointmentId}
                    />
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="consultations">
                        <ConsultationHistory
                            query={consultationsQuery}
                            page={consultationsPage}
                            onPageChange={setConsultationsPage}
                            onViewConsultation={setConsultationId}
                        />
                    </TabsContent>
                )}

                <TabsContent value="data">
                    <PatientPersonalData patient={patient} reduced={user?.role === Role.ASISTENTE} />
                </TabsContent>
            </Tabs>

            <CreateAppointmentModal
                open={appointmentModal.open}
                onOpenChange={appointmentModal.setOpen}
                canPickPatient
                defaultPatient={{ id: patient.id, name: patient.name, lastname: patient.lastname }}
            />

            <AppointmentWorkflow
                appointmentId={editAppointmentId}
                role={user?.role ?? ""}
                onClose={() => setEditAppointmentId(null)}
            />

            {isAdmin && (
                <ConsultationDetailModal consultationId={consultationId} onClose={() => setConsultationId(null)} />
            )}

            {isAdmin && (
                <Modal open={editDialog.open} onClose={editDialog.setOpen} title="Editar paciente">
                    <EditPatientForm key={patient.id} patient={patient} onSuccess={editDialog.hide} onCancel={editDialog.hide} />
                </Modal>
            )}
        </>
    );
}
