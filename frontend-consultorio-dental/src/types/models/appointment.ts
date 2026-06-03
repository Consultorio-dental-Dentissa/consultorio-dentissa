export interface Appointment {
    id: number;
    scheduled_at: Date;
    scheduled_at_end: Date;
    time: string;
    durationMinutes: number;
    status: string;
    created_at: Date;
    notes: string;
    patient: {
        name: string
        lastname: string
    },
    service: {
        name: string
    }
}