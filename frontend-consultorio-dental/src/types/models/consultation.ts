export interface Consultation {
    id: number;
    notes: string;
    observations: string;
    created_at: Date;
    appointment_id: number;
    scheduled_at: Date;
    patient: {
        name: string;
        lastname: string;
    };
    service: {
        name: string;
    };
}
