import { useId, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_IMAGE_TYPES } from "@/features/consultations/types/image-files";
import { MAX_CONSULTATION_IMAGE_MB } from "@/features/consultations/types/consultation.model";

interface ImageDropzoneProps {
    onFiles: (files: File[]) => void;
    disabled?: boolean;
    remaining: number;
}

/** Zona punteada de docs/DISEÑO (Consultas): arrastrar o explorar, con teclado y lector de pantalla. */
export function ImageDropzone({ onFiles, disabled, remaining }: ImageDropzoneProps) {
    const inputId = useId();
    const [dragging, setDragging] = useState(false);
    const blocked = disabled || remaining <= 0;

    const handle = (list: FileList | null) => {
        const files = Array.from(list ?? []);
        if (files.length > 0) onFiles(files);
    };

    return (
        <div
            onDragOver={(event) => { event.preventDefault(); if (!blocked) setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (!blocked) handle(event.dataTransfer.files);
            }}
            className={cn(
                "rounded-[11px] border-[1.5px] border-dashed border-[#d4d4d8] p-[22px] text-center text-ink-4 transition-colors focus-within:ring-3 focus-within:ring-ring/50",
                dragging && "border-brand bg-brand-soft",
                blocked && "opacity-60",
            )}
        >
            <input
                id={inputId} type="file" multiple accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className="sr-only" disabled={blocked}
                onChange={(event) => { handle(event.target.files); event.target.value = ""; }}
            />
            <Upload className="mx-auto mb-1.5 size-6 text-[#c4c4cc]" aria-hidden="true" />
            <p className="text-sm font-semibold">
                {remaining <= 0 ? "Límite de imágenes alcanzado" : (
                    <>
                        Arrastra imágenes aquí o{" "}
                        <label htmlFor={inputId} className={cn("text-brand", !blocked && "cursor-pointer underline-offset-2 hover:underline")}>
                            explora
                        </label>
                    </>
                )}
            </p>
            <p className="mt-0.5 text-[13.5px]">JPG, PNG o WebP hasta {MAX_CONSULTATION_IMAGE_MB} MB · puedes agregar {Math.max(remaining, 0)} más</p>
        </div>
    );
}
