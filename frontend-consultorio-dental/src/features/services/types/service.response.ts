export interface ServiceImageResponse {
    id: number;
    /** Ruta relativa del backend, p. ej. /services/3/images/7. */
    url: string;
}

export interface ServiceResponse {
    id: number;
    name: string;
    durationMinutes: number;
    price: string;
    description: string;
    status: boolean;
    images?: ServiceImageResponse[];
}
