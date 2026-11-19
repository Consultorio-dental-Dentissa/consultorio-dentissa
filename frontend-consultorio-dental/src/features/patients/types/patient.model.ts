export interface Patient {
    id: number;
    /** Id de la cuenta de usuario asociada (para activar/desactivar con PATCH /users/status/:id). */
    user_id: number | null;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    status: boolean;
    /** null cuando la ficha es reducida (ASISTENTE). */
    address: string | null;
    birth_date: Date | null;
    emergency_phone: string | null;
    /** Próxima cita futura (solo en el listado; null si no hay). */
    next_appointment_at: Date | null;
}

export interface PatientAppointmentHistoryItem {
    id: number;
    scheduled_at: Date;
    scheduled_at_end: Date;
    durationMinutes: number;
    status: string;
    notes: string;
    cancel_reason: string | null;
    service_name: string;
    has_consultation: boolean;
}

export interface PatientConsultationHistoryItem {
    id: number;
    appointment_id: number;
    scheduled_at: Date;
    service_name: string;
    description: string;
    observations: string | null;
    images_count: number;
    /** Rutas de las imágenes (se descargan con credenciales). */
    images: { id: number; path: string }[];
}
