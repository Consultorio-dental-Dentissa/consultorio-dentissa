import { useQuery } from "@tanstack/react-query";
import { getPublicFaqs, getPublicOffers, getPublicStats } from "@/features/public/services/public.service";

export function usePublicFaqs() {
    return useQuery({
        queryKey: ["public", "faq"],
        queryFn: () => getPublicFaqs(),
    });
}

export function usePublicStats() {
    return useQuery({
        queryKey: ["public", "stats"],
        queryFn: () => getPublicStats(),
    });
}

export function usePublicOffers() {
    return useQuery({
        queryKey: ["public", "offers"],
        queryFn: () => getPublicOffers(),
    });
}
