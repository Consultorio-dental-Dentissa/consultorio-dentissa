import { MAX_CONSULTATION_IMAGE_MB } from "@/features/consultations/types/consultation.model";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Validación previa en el navegador; el backend vuelve a validar el tipo real y el tamaño. */
export function validateImageFiles(files: File[]): string | null {
    for (const file of files) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            return `"${file.name}" no es válida: usa imágenes JPG, PNG o WebP.`;
        }
        if (file.size > MAX_CONSULTATION_IMAGE_MB * 1024 * 1024) {
            return `"${file.name}" supera los ${MAX_CONSULTATION_IMAGE_MB} MB.`;
        }
    }
    return null;
}
