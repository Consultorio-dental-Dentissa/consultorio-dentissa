import { deleteR, get, patch, post } from "@/services/api";
import { buildQueryString } from "@/utils/query";
import type { Faq, FaqDto, FaqFilters } from "@/features/faq/types/faq.model";
import type { Paginated } from "@/types/pagination";

/** Administración: incluye preguntas activas e inactivas (GET /faq/admin). */
export async function getAdminFaqs(filters: FaqFilters = {}): Promise<Paginated<Faq>> {
    const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        status: filters.status,
    });
    const response = await get<Paginated<Faq>>(`/faq/admin${query}`);
    const { items, total, page, limit } = response.data;

    return {
        items: items.map(({ id, question, response: answer, status }) => ({ id, question, response: answer, status })),
        total, page, limit,
    };
}

export async function createFaq(dto: FaqDto) {
    const response = await post<Faq>("/faq", dto);
    return response.data;
}

export async function updateFaq(id: number, dto: Pick<FaqDto, "question" | "response">) {
    const response = await patch<Faq>(`/faq/${id}`, dto);
    return response.data;
}

export async function updateFaqStatus(id: number, status: boolean) {
    const response = await patch<Faq>(`/faq/${id}/status`, { status });
    return response.data;
}

export async function deleteFaq(id: number) {
    const response = await deleteR<unknown>(`/faq/${id}`);
    return response.data;
}
