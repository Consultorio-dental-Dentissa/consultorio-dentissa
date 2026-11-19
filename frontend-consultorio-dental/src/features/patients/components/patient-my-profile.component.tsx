import { CalendarDays, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state.component";
import { Modal } from "@/components/shared/modal.component";
import { ProfileHero } from "@/components/shared/profile-hero.component";
import { RoleBadge } from "@/components/shared/status-badge.component";
import { TableCard } from "@/components/shared/table-card.component";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { EditMyProfileForm } from "@/features/patients/components/edit-my-profile-form.component";
import { PatientPersonalData } from "@/features/patients/components/patient-personal-data.component";
import { useMyPatientProfile } from "@/features/patients/hooks/use-patients";
import { Role } from "@/features/users/types/rol.enum";
import { useDisclosure } from "@/hooks/use-disclosure";
import { formatMonthYear, formatPhone } from "@/utils/formatters";

/** Paciente - Mi perfil.dc.html: cabecera, tres tarjetas de datos y "Modificar datos" (PATCH /patients/me). */
export function PatientMyProfile() {
    const { user } = useAuth();
    const profileQuery = useMyPatientProfile();
    const editDialog = useDisclosure();
    const passwordDialog = useDisclosure();

    if (profileQuery.isPending) {
        return (
            <div className="flex items-center gap-8 rounded-xl border border-line bg-surface px-8 py-7" aria-busy="true">
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-11 w-36" />
            </div>
        );
    }

    if (profileQuery.isError) {
        return (
            <TableCard>
                <ErrorState message={profileQuery.error.message} onRetry={() => profileQuery.refetch()} />
            </TableCard>
        );
    }

    const patient = profileQuery.data;
    const memberSince = user?.created_at;

    return (
        <>
            <ProfileHero
                label="Resumen de mi perfil"
                title={`${patient.name} ${patient.lastname}`}
                badge={<RoleBadge role={Role.PACIENTE} />}
                meta={[
                    { icon: Mail, text: patient.email },
                    { icon: Phone, text: formatPhone(patient.phone) },
                    ...(memberSince ? [{ icon: CalendarDays, text: `Paciente desde ${formatMonthYear(memberSince)}` }] : []),
                ]}
                actions={
                    <>
                        <Button onClick={editDialog.show}>Modificar datos</Button>
                        <Button variant="outline" size="sm" onClick={passwordDialog.show}>Cambiar contraseña</Button>
                    </>
                }
            />

            <PatientPersonalData patient={patient} memberSince={memberSince} reduced={user?.role === Role.ASISTENTE} />

            <Modal open={editDialog.open} onClose={editDialog.setOpen} title="Modificar datos">
                <EditMyProfileForm patient={patient} onSuccess={editDialog.hide} onCancel={editDialog.hide} />
            </Modal>

            <Modal open={passwordDialog.open} onClose={passwordDialog.setOpen} title="Cambiar contraseña">
                <ChangePasswordForm onSuccess={passwordDialog.hide} onCancel={passwordDialog.hide} />
            </Modal>
        </>
    );
}
