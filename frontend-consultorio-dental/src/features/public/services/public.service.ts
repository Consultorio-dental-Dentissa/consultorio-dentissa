import type { Paginated } from "@/types/pagination";
import type { PublicFaq, PublicOffer, PublicOfferResponse } from "@/features/public/types/public.types";
import { get, resolveApiUrl } from "@/services/api";
import { buildQueryString, mapPaginated } from "@/utils/query";

export async function getPublicFaqs(limit = 50): Promise<Paginated<PublicFaq>> {
    const response = await get<Paginated<PublicFaq>>(`/faq${buildQueryString({ limit })}`);
    return response.data;
}

export interface PublicStats {
    patients: number;
    treatments: number;
}

/** Pacientes registrados y tratamientos activos (endpoint público, solo conteos). */
export async function getPublicStats(): Promise<PublicStats> {
    const response = await get<PublicStats>("/public/stats");
    return response.data;
}

function offerMap(offer: PublicOfferResponse): PublicOffer {
    return {
        id: offer.id,
        name: offer.name,
        description: offer.description,
        startDate: new Date(offer.start_date),
        endDate: new Date(offer.end_date),
        imageUrl: offer.image_url ? resolveApiUrl(offer.image_url) : null,
        services: offer.services ?? [],
    };
}

/** Ofertas activas y vigentes (endpoint público). */
export async function getPublicOffers(limit = 50): Promise<Paginated<PublicOffer>> {
    const response = await get<Paginated<PublicOfferResponse>>(`/offers${buildQueryString({ limit })}`);
    return mapPaginated(response.data, offerMap);
}
