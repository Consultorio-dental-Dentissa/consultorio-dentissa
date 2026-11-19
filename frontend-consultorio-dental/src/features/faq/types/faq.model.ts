import type { PaginationParams } from "@/types/pagination";

/** Elemento de GET /faq/admin (el backend llama `response` a la respuesta). */
export interface Faq {
    id: number;
    question: string;
    response: string;
    status: boolean;
}

export interface FaqFilters extends PaginationParams {
    search?: string;
    /** ACTIVO | INACTIVO | TODOS. */
    status?: string;
}

export interface FaqDto {
    question: string;
    response: string;
    status?: boolean;
}

export const FAQ_QUESTION_MAX = 300;
export const FAQ_RESPONSE_MAX = 2000;
