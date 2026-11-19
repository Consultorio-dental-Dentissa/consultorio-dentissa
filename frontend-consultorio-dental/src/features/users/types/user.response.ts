export interface UserResponse {
    id: number;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    status: boolean;
    created_at: string;
    /** Los listados devuelven `{ role }`; /auth/me devuelve el texto directo. */
    role: string | { id?: number; role: string };
    patient_id?: number | null;
}
