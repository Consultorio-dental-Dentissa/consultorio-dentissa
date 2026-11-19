import { CalendarDays, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoCard } from "@/components/shared/info-card.component";
import { InfoRow } from "@/components/shared/info-row.component";
import { Modal } from "@/components/shared/modal.component";
import { ProfileHero } from "@/components/shared/profile-hero.component";
import { Badge } from "@/components/ui/badge";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { EditMyUserForm } from "@/features/users/components/edit-my-user-form.component";
import { Role } from "@/features/users/types/rol.enum";
import { ROLE_LABELS } from "@/config/labels";
import { capitalize } from "@/utils/clinic-time";
import { useDisclosure } from "@/hooks/use-disclosure";
import { formatMonthYear, formatPhone } from "@/utils/formatters";

/**
 * Perfil de usuario.dc.html (ADMIN y ASISTENTE), con datos de GET /auth/me. Nacimiento, dirección y emergencia no se
 * muestran: solo existen en la ficha de paciente. El ADMIN edita sus datos (PATCH /users/:id); el ASISTENTE es de
 * solo lectura (no hay endpoint propio) y solo puede cambiar su contraseña.
 */
export function UserProfile() {
    const { user } = useAuth();
    const editDialog = useDisclosure();
    const passwordDialog = useDisclosure();

    if (!user) return null;

    const isAdmin = user.role === Role.ADMINISTRADOR;
    const since = formatMonthYear(user.created_at);

    return (
        <>
            <ProfileHero
                label="Resumen de mi perfil"
                title={`${user.name} ${user.lastname}`}
                badge={<Badge variant="patient">{ROLE_LABELS[user.role] ?? user.role}</Badge>}
                meta={[
                    { icon: Mail, text: user.email },
                    { icon: Phone, text: formatPhone(user.phone) },
                    { icon: CalendarDays, text: `En Dentissa desde ${since}` },
                ]}
                actions={
                    <>
                        {isAdmin && <Button onClick={editDialog.show}>Modificar datos</Button>}
                        <Button variant={isAdmin ? "outline" : "default"} size={isAdmin ? "sm" : "default"} onClick={passwordDialog.show}>
                            Cambiar contraseña
                        </Button>
                    </>
                }
            />

            <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
                <InfoCard title="Información personal" icon={User}>
                    <InfoRow label="Nombre completo" value={`${user.name} ${user.lastname}`} />
                    <InfoRow label="Rol" value={ROLE_LABELS[user.role] ?? user.role} />
                    <InfoRow label="En Dentissa desde" value={capitalize(since)} />
                </InfoCard>
                <InfoCard title="Contacto" icon={Phone}>
                    <InfoRow label="Teléfono" value={formatPhone(user.phone)} />
                    <InfoRow label="Correo electrónico" value={user.email} />
                </InfoCard>
            </div>

            {isAdmin && (
                <Modal open={editDialog.open} onClose={editDialog.setOpen} title="Modificar datos">
                    <EditMyUserForm user={user} onSuccess={editDialog.hide} onCancel={editDialog.hide} />
                </Modal>
            )}

            <Modal open={passwordDialog.open} onClose={passwordDialog.setOpen} title="Cambiar contraseña">
                <ChangePasswordForm onSuccess={passwordDialog.hide} onCancel={passwordDialog.hide} />
            </Modal>
        </>
    );
}
