import { useState } from "react";
import toast from "react-hot-toast";
import { Alert } from "@/components/shared/alert.component";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { ConsultationImage } from "@/features/consultations/components/consultation-image.component";
import { ImageDropzone } from "@/features/consultations/components/image-dropzone.component";
import { validateImageFiles } from "@/features/consultations/types/image-files";
import {
    useDeleteConsultationImage, useUploadConsultationImages,
} from "@/features/consultations/hooks/use-consultations";
import { MAX_CONSULTATION_IMAGES, type Consultation } from "@/features/consultations/types/consultation.model";

/** Galería de la consulta: ver, descargar, subir (máx. 5) y eliminar imágenes. */
export function ConsultationImagesManager({ consultation, editable }: { consultation: Consultation; editable: boolean }) {
    const [error, setError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const uploadMutation = useUploadConsultationImages();
    const deleteMutation = useDeleteConsultationImage(consultation.id);

    const remaining = MAX_CONSULTATION_IMAGES - consultation.images.length;
    const busy = uploadMutation.isPending || deleteMutation.isPending;

    const handleFiles = (files: File[]) => {
        if (files.length > remaining) {
            setError(`Solo puedes agregar ${remaining} imagen(es) más (máximo ${MAX_CONSULTATION_IMAGES} por consulta).`);
            return;
        }
        const invalid = validateImageFiles(files);
        setError(invalid);
        if (invalid) return;

        uploadMutation.mutate(
            { consultationId: consultation.id, files },
            {
                onSuccess: () => toast.success(files.length === 1 ? "Imagen subida" : "Imágenes subidas"),
                onError: (err) => setError(err.message),
            },
        );
    };

    const confirmDelete = () => {
        if (deleteTarget === null) return;
        deleteMutation.mutate(deleteTarget, {
            onSuccess: () => {
                toast.success("Imagen eliminada");
                setDeleteTarget(null);
            },
            onError: (err) => {
                setError(err.message);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <div className="flex flex-col gap-3">
            {error && <Alert>{error}</Alert>}

            {consultation.images.length === 0 ? (
                <p className="text-sm font-medium text-muted-foreground">Esta consulta no tiene imágenes adjuntas.</p>
            ) : (
                <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {consultation.images.map((image, index) => (
                        <li key={image.id}>
                            <ConsultationImage
                                path={image.path}
                                alt={`Imagen ${index + 1} de la consulta`}
                                disabled={busy}
                                onDelete={editable ? () => setDeleteTarget(image.id) : undefined}
                            />
                        </li>
                    ))}
                </ul>
            )}

            {editable && <ImageDropzone onFiles={handleFiles} disabled={busy} remaining={remaining} />}
            {uploadMutation.isPending && <p role="status" className="text-xs font-semibold text-muted-foreground">Subiendo imágenes...</p>}

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                destructive
                title="¿Eliminar esta imagen?"
                description="La imagen se eliminará de forma permanente del expediente de la consulta."
                confirmLabel="Eliminar"
                loading={deleteMutation.isPending}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
