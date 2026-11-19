import type { PaginationParams } from "@/types/pagination";

/** Elemento de GET /offers/admin. `image_url` es una ruta autenticada del backend. */
export interface OfferResponse {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: boolean;
    image_url: string | null;
    services: { id: number; name: string; status: boolean }[];
}

export interface Offer {
    id: number;
    name: string;
    description: string;
    /** Día AAAA-MM-DD en la zona del consultorio. */
    start_date: string;
    end_date: string;
    status: boolean;
    image_path: string | null;
    services: { id: number; name: string; status: boolean }[];
}

export interface OfferFilters extends PaginationParams {
    search?: string;
    /** ACTIVO | INACTIVO | TODOS. */
    status?: string;
    /** Ofertas vigentes en este día (AAAA-MM-DD). */
    date?: string;
}

export interface OfferDto {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: boolean;
    serviceIds: number[];
}

export type OfferValidity = "current" | "upcoming" | "expired";
