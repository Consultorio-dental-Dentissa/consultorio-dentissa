export interface ConsultationResponse {
    id: number;
    notes: string;
    observations: string;
    created_at: string;
    appointment_id: number;
    scheduled_at: string;
    patient: {
        name: string;
        lastname: string;
    };
    service: {
        name: string;
    };
}
