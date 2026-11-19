import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createConsultation,
    deleteConsultationImage,
    fetchConsultationImage,
    getAllConsultations,
    getConsultationById,
    updateConsultation,
    uploadConsultationImages,
} from "@/features/consultations/services/consultations.service";
import type {
    ConsultationFilters,
    CreateConsultationDto,
    UpdateConsultationDto,
} from "@/features/consultations/types/consultation.filters";

export function useConsultations(filters?: ConsultationFilters, enabled = true) {
    return useQuery({
        queryKey: ["consultations", "list", filters],
        queryFn: () => getAllConsultations(filters),
        placeholderData: keepPreviousData,
        enabled,
    });
}

export function useConsultation(id: number | null) {
    return useQuery({
        queryKey: ["consultations", "detail", id],
        queryFn: () => getConsultationById(id as number),
        enabled: id !== null,
    });
}

/** Consulta ya registrada para una cita (si existe), buscando por paciente y día de la cita. */
export function useConsultationOfAppointment(
    appointmentId: number | null,
    patientId: number | null,
    day: string | null,
    enabled: boolean,
) {
    return useQuery({
        queryKey: ["consultations", "by-appointment", appointmentId],
        queryFn: async () => {
            const result = await getAllConsultations({
                patient_id: patientId as number,
                from: day as string,
                to: day as string,
                limit: 100,
            });
            return result.items.find((item) => item.appointment_id === appointmentId) ?? null;
        },
        enabled: enabled && appointmentId !== null && patientId !== null && day !== null,
    });
}

/** Las consultas alimentan listados, el historial del paciente y las estadísticas. */
function useInvalidateConsultations() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
        queryClient.invalidateQueries({ queryKey: ["patients"] });
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["audit"] });
    };
}

export function useCreateConsultation() {
    const invalidate = useInvalidateConsultations();
    return useMutation({
        mutationFn: (dto: CreateConsultationDto) => createConsultation(dto),
        onSuccess: invalidate,
    });
}

export function useUpdateConsultation(id: number) {
    const invalidate = useInvalidateConsultations();
    return useMutation({
        mutationFn: (dto: UpdateConsultationDto) => updateConsultation(id, dto),
        onSuccess: invalidate,
    });
}

export function useUploadConsultationImages() {
    const invalidate = useInvalidateConsultations();
    return useMutation({
        mutationFn: ({ consultationId, files }: { consultationId: number; files: File[] }) =>
            uploadConsultationImages(consultationId, files),
        onSuccess: invalidate,
    });
}

export function useDeleteConsultationImage(consultationId: number) {
    const invalidate = useInvalidateConsultations();
    return useMutation({
        mutationFn: (imageId: number) => deleteConsultationImage(consultationId, imageId),
        onSuccess: invalidate,
    });
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
        reader.readAsDataURL(blob);
    });
}

/**
 * Imagen privada descargada con credenciales y convertida a data URL (no requiere
 * liberar object URLs); la caché evita volver a descargarla.
 */
export function useConsultationImage(path: string) {
    return useQuery({
        queryKey: ["consultation-image", path],
        queryFn: async () => blobToDataUrl(await fetchConsultationImage(path)),
        staleTime: 5 * 60_000,
        // Datos clínicos: no se conservan en memoria más de 1 minuto sin uso.
        gcTime: 60_000,
        retry: 1,
    });
}
