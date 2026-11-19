import { ImageIcon } from "lucide-react";
import { useConsultationImage } from "@/features/consultations/hooks/use-consultations";
import type { ConsultationImage } from "@/features/consultations/types/consultation.model";

/** Miniatura circular (34px, borde blanco 2px) de una imagen clínica privada: se descarga con credenciales. */
export function ConsultationThumb({ image, alt }: { image: ConsultationImage; alt: string }) {
    const query = useConsultationImage(image.path);
    return (
        <span className="-ml-2.5 flex size-[34px] items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-fill first:ml-0">
            {query.data ? (
                <img src={query.data} alt={alt} className="size-full object-cover" />
            ) : (
                <ImageIcon className="size-3.5 text-ink-5" aria-hidden="true" />
            )}
        </span>
    );
}
