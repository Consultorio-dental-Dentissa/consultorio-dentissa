export interface ConsultationImage {
    id: number;
    /** Ruta del endpoint autenticado que sirve la imagen. */
    path: string;
}

export interface Consultation {
    id: number;
    appointment_id: number;
    description: string;
    observations: string;
    created_at: Date;
    updated_at: Date;
    scheduled_at: Date;
    service_name: string;
    patient: { id: number; name: string; lastname: string };
    images: ConsultationImage[];
}

export const MAX_CONSULTATION_IMAGES = 5;
export const MAX_CONSULTATION_IMAGE_MB = 5;
