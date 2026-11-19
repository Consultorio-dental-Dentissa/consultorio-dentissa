import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createOffer,
    deleteOffer,
    deleteOfferImage,
    fetchOfferImage,
    getAdminOffers,
    setOfferImage,
    updateOffer,
    updateOfferStatus,
} from "@/features/offers/services/offers.service";
import type { OfferDto, OfferFilters } from "@/features/offers/types/offer.model";

export function useAdminOffers(filters?: OfferFilters, enabled = true) {
    return useQuery({
        queryKey: ["offers", "admin", filters],
        queryFn: () => getAdminOffers(filters),
        placeholderData: keepPreviousData,
        enabled,
    });
}

/** Mutar ofertas refresca listados, el panel (ofertas vigentes) y la auditoría. */
function useInvalidateOffers() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["offers"] });
        // El sitio público lista las ofertas vigentes
        queryClient.invalidateQueries({ queryKey: ["public"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["audit"] });
    };
}

export function useCreateOffer() {
    const invalidate = useInvalidateOffers();
    return useMutation({ mutationFn: (dto: OfferDto) => createOffer(dto), onSuccess: invalidate });
}

export function useUpdateOffer() {
    const invalidate = useInvalidateOffers();
    return useMutation({
        mutationFn: ({ id, ...dto }: Partial<Omit<OfferDto, "status">> & { id: number }) => updateOffer(id, dto),
        onSuccess: invalidate,
    });
}

export function useUpdateOfferStatus() {
    const invalidate = useInvalidateOffers();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: boolean }) => updateOfferStatus(id, status),
        onSuccess: invalidate,
    });
}

export function useDeleteOffer() {
    const invalidate = useInvalidateOffers();
    return useMutation({ mutationFn: (id: number) => deleteOffer(id), onSuccess: invalidate });
}

export function useSetOfferImage() {
    const invalidate = useInvalidateOffers();
    return useMutation({
        mutationFn: ({ id, file }: { id: number; file: File }) => setOfferImage(id, file),
        onSuccess: invalidate,
    });
}

export function useDeleteOfferImage() {
    const invalidate = useInvalidateOffers();
    return useMutation({ mutationFn: (id: number) => deleteOfferImage(id), onSuccess: invalidate });
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
        reader.readAsDataURL(blob);
    });
}

/** Imagen de la oferta (endpoint de administración con credenciales) como data URL. */
export function useOfferImage(path: string | null) {
    return useQuery({
        queryKey: ["offers", "image", path],
        queryFn: async () => blobToDataUrl(await fetchOfferImage(path as string)),
        enabled: path !== null,
        staleTime: 5 * 60_000,
        retry: 1,
    });
}
