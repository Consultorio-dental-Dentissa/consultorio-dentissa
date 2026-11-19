/**
 * Ficha de paciente. Para ASISTENTE el backend omite address, birth_date
 * y emergency_phone (ficha reducida), por eso son opcionales.
 */
export interface PatientResponse {
    id: number;
    user_id?: number;
    /** Solo en el listado: próxima cita futura o null. */
    next_appointment_at?: string | null;
    address?: string;
    birth_date?: string;
    emergency_phone?: string;
    user: {
        name: string;
        lastname: string;
        email: string;
        phone: string;
        status: boolean;
    };
}

export interface PatientAppointmentHistoryResponse {
    id: number;
    scheduled_at: string;
    durationMinutes: number;
    status: string;
    notes: string;
    cancel_reason: string | null;
    created_at: string;
    service: { id: number; name: string };
    /** Solo lo recibe el ADMIN. */
    consultation_id?: number | null;
}

export interface PatientConsultationHistoryResponse {
    id: number;
    appointment_id: number;
    description: string;
    dentistObservations: string | null;
    created_at: string;
    appointment: {
        id: number;
        scheduled_at: string;
        status: string;
        service: { id?: number; name: string };
    };
    images: { id: number; url: string }[];
}
