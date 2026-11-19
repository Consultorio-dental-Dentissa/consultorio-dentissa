import { useAuth } from "@/features/auth/hooks/use-auth";
import { PatientMyProfile } from "@/features/patients/components/patient-my-profile.component";
import { UserProfile } from "@/features/users/components/user-profile.component";
import { Role } from "@/features/users/types/rol.enum";

/**
 * Ruta /mi-perfil para todos los roles: el PACIENTE ve "Paciente - Mi perfil" (GET/PATCH /patients/me);
 * ADMINISTRADOR y ASISTENTE ven "Perfil de usuario" (GET /auth/me).
 */
export default function MyProfilePage() {
    const { user } = useAuth();
    return user?.role === Role.PACIENTE ? <PatientMyProfile /> : <UserProfile />;
}
