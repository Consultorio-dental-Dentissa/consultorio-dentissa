export interface RespuestaCita {
    id: number;
    date: Date;
    time: string;
    durationMinutes: number;
    status: string;
    created_at: Date;
    patient: {
        name: string
        lastname: string
    },
    service: {
        name: string
    }
}