export interface ServiceImage {
    id: number;
    /** URL absoluta lista para usar en <img src>. */
    url: string;
}

export interface Service {
    id: number;
    name: string;
    durationMinutes: number;
    price: string;
    description: string;
    status: boolean;
    images: ServiceImage[];
}

export const MAX_SERVICE_IMAGES = 5;
export const MAX_IMAGE_SIZE_MB = 5;
