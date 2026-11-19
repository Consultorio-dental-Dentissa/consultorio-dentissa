import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFaq, deleteFaq, getAdminFaqs, updateFaq, updateFaqStatus } from "@/features/faq/services/faq.service";
import type { FaqDto, FaqFilters } from "@/features/faq/types/faq.model";

export function useAdminFaqs(filters?: FaqFilters) {
    return useQuery({
        queryKey: ["faq", "admin", filters],
        queryFn: () => getAdminFaqs(filters),
        placeholderData: keepPreviousData,
    });
}

/** Toda mutación refresca listados y estadísticas de FAQ (y el panel de auditoría). */
function useInvalidateFaq() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["faq"] });
        // El sitio público lista las preguntas activas
        queryClient.invalidateQueries({ queryKey: ["public"] });
        queryClient.invalidateQueries({ queryKey: ["audit"] });
    };
}

export function useCreateFaq() {
    const invalidate = useInvalidateFaq();
    return useMutation({ mutationFn: (dto: FaqDto) => createFaq(dto), onSuccess: invalidate });
}

export function useUpdateFaq() {
    const invalidate = useInvalidateFaq();
    return useMutation({
        mutationFn: ({ id, ...dto }: Pick<FaqDto, "question" | "response"> & { id: number }) => updateFaq(id, dto),
        onSuccess: invalidate,
    });
}

export function useUpdateFaqStatus() {
    const invalidate = useInvalidateFaq();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: boolean }) => updateFaqStatus(id, status),
        onSuccess: invalidate,
    });
}

export function useDeleteFaq() {
    const invalidate = useInvalidateFaq();
    return useMutation({ mutationFn: (id: number) => deleteFaq(id), onSuccess: invalidate });
}
