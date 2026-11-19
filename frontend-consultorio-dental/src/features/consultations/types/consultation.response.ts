/** Elemento de GET /consultations y GET /consultations/:id. */
export interface ConsultationResponse {
    id: number;
    appointment_id: number;
    description: string;
    dentistObservations: string;
    created_at: string;
    updated_at: string;
    created_by_id: number | null;
    updated_by_id: number | null;
    appointment: {
        id: number;
        scheduled_at: string;
        status: string;
        service: { id: number; name: string };
    };
    patient: { id: number; name: string; lastname: string };
    /** `url` es una ruta del backend (autenticada), no una URL pública. */
    images: { id: number; url: string }[];
}
