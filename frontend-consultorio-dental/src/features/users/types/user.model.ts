export interface User {
    id: number;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    status: boolean;
    created_at: Date;
    role: string;
    /** Solo para PACIENTE: id de su ficha de paciente (viene de /auth/me). */
    patient_id: number | null;
}
