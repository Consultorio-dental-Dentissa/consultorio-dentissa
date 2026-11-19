export interface UpdateServiceDto {
    name?: string;
    description?: string;
    price?: number;
    /** 15 a 120 minutos. */
    durationMinutes?: number;
}
