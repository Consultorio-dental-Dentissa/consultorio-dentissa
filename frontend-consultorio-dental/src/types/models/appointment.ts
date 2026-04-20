export interface Appointment {
    id: number;
    date: Date;
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