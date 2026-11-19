import { deleteR, get, getBlob, patch, post, putForm } from "@/services/api";
import { buildQueryString } from "@/utils/query";
import { clinicDayKey } from "@/utils/clinic-time";
import type { Offer, OfferDto, OfferFilters, OfferResponse } from "@/features/offers/types/offer.model";
import type { Paginated } from "@/types/pagination";

export function offerMap(response: OfferResponse): Offer {
    return {
        id: response.id,
        name: response.name,
        description: response.description,
        start_date: clinicDayKey(new Date(response.start_date)),
        end_date: clinicDayKey(new Date(response.end_date)),
        status: response.status,
        image_path: response.image_url,
        services: response.services,
    };
}

export async function getAdminOffers(filters: OfferFilters = {}): Promise<Paginated<Offer>> {
    const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        status: filters.status,
        date: filters.date,
    });
    const response = await get<Paginated<OfferResponse>>(`/offers/admin${query}`);
    const { items, total, page, limit } = response.data;

    return { items: items.map(offerMap), total, page, limit };
}

export async function createOffer(dto: OfferDto): Promise<Offer> {
    const response = await post<OfferResponse>("/offers", dto);
    return offerMap(response.data);
}

export async function updateOffer(id: number, dto: Partial<Omit<OfferDto, "status">>): Promise<Offer> {
    const response = await patch<OfferResponse>(`/offers/${id}`, dto);
    return offerMap(response.data);
}

export async function updateOfferStatus(id: number, status: boolean) {
    const response = await patch<unknown>(`/offers/${id}/status`, { status });
    return response.data;
}

export async function deleteOffer(id: number) {
    const response = await deleteR<unknown>(`/offers/${id}`);
    return response.data;
}

/** Sube o reemplaza la imagen única de la oferta (campo multipart `image`). */
export async function setOfferImage(id: number, file: File) {
    const body = new FormData();
    body.append("image", file);
    const response = await putForm<unknown>(`/offers/${id}/image`, body);
    return response.data;
}

export async function deleteOfferImage(id: number) {
    const response = await deleteR<unknown>(`/offers/${id}/image`);
    return response.data;
}

/** Vista previa de administración (también para ofertas inactivas o vencidas). */
export function fetchOfferImage(path: string): Promise<Blob> {
    return getBlob(path);
}
