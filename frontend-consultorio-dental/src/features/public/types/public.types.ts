export interface PublicFaq {
    id: number;
    question: string;
    response: string;
}

export interface PublicOfferService {
    id: number;
    name: string;
}

export interface PublicOffer {
    id: number;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    /** URL absoluta de la imagen o null si la oferta no tiene. */
    imageUrl: string | null;
    services: PublicOfferService[];
}

export interface PublicOfferResponse {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    image_url: string | null;
    services: PublicOfferService[];
}
