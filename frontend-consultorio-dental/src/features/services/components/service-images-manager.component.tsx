import { useId, useRef, useState } from "react";
import { ImagePlus, Replace, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Alert } from "@/components/shared/alert.component";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    useDeleteServiceImage, useReplaceServiceImage, useUploadServiceImages,
} from "@/features/services/hooks/use-services";
import { ServiceImage } from "@/features/services/components/service-image.component";
import { MAX_IMAGE_SIZE_MB, MAX_SERVICE_IMAGES, type Service } from "@/features/services/types/service.model";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Validación previa en el navegador; el backend vuelve a validar tipo real y tamaño. */
function validateFiles(files: File[]): string | null {
    for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return `"${file.name}" no es válida: usa imágenes JPG, PNG o WebP.`;
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            return `"${file.name}" supera los ${MAX_IMAGE_SIZE_MB} MB.`;
        }
    }
    return null;
}

interface ServiceImagesManagerProps {
    service: Service;
}

export function ServiceImagesManager({ service }: ServiceImagesManagerProps) {
    const uploadId = useId();
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const [replaceTarget, setReplaceTarget] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const uploadMutation = useUploadServiceImages(service.id);
    const replaceMutation = useReplaceServiceImage(service.id);
    const deleteMutation = useDeleteServiceImage(service.id);

    const remaining = MAX_SERVICE_IMAGES - service.images.length;
    const busy = uploadMutation.isPending || replaceMutation.isPending || deleteMutation.isPending;

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (files.length === 0) return;

        if (files.length > remaining) {
            setFileError(`Solo puedes agregar ${remaining} imagen(es) más (máximo ${MAX_SERVICE_IMAGES}).`);
            return;
        }

        const invalid = validateFiles(files);
        setFileError(invalid);
        if (invalid) return;

        uploadMutation.mutate(files, {
            onSuccess: () => toast.success(files.length === 1 ? "Imagen subida" : "Imágenes subidas"),
            onError: (error) => setFileError(error.message),
        });
    };

    const handleReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        const imageId = replaceTarget;
        setReplaceTarget(null);
        if (!file || imageId === null) return;

        const invalid = validateFiles([file]);
        setFileError(invalid);
        if (invalid) return;

        replaceMutation.mutate(
            { imageId, file },
            {
                onSuccess: () => toast.success("Imagen reemplazada"),
                onError: (error) => setFileError(error.message),
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
            onError: (error) => {
                // 409: un servicio activo debe conservar al menos una imagen
                setFileError(error.message);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                {service.images.length} de {MAX_SERVICE_IMAGES} imágenes. Formatos JPG, PNG o WebP de hasta {MAX_IMAGE_SIZE_MB} MB.
            </p>

            {fileError && <Alert>{fileError}</Alert>}

            {service.images.length === 0 ? (
                <Alert variant="warning" title="Sin imágenes">
                    Un servicio necesita al menos una imagen para poder activarse.
                </Alert>
            ) : (
                <ul className="grid grid-cols-2 gap-3">
                    {service.images.map((image, index) => (
                        <li key={image.id} className="overflow-hidden rounded-xl border border-border/70 bg-surface">
                            <ServiceImage
                                src={image.url}
                                alt={`Imagen ${index + 1} de ${service.name}`}
                                className="aspect-4/3 w-full"
                            />
                            <div className="flex items-center justify-end gap-1 p-2">
                                <Button
                                    variant="ghost" size="icon-sm" disabled={busy}
                                    onClick={() => {
                                        setReplaceTarget(image.id);
                                        replaceInputRef.current?.click();
                                    }}
                                    aria-label={`Reemplazar imagen ${index + 1}`} title="Reemplazar"
                                >
                                    <Replace />
                                </Button>
                                <Button
                                    variant="destructive" size="icon-sm" disabled={busy}
                                    onClick={() => setDeleteTarget(image.id)}
                                    aria-label={`Eliminar imagen ${index + 1}`} title="Eliminar"
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <input
                ref={replaceInputRef} type="file" accept={ACCEPTED_TYPES.join(",")}
                className="sr-only" tabIndex={-1} aria-hidden="true" onChange={handleReplace}
            />

            <div>
                <input
                    id={uploadId} type="file" multiple accept={ACCEPTED_TYPES.join(",")}
                    className="sr-only" onChange={handleUpload} disabled={busy || remaining <= 0}
                />
                <Button asChild variant="outline" aria-disabled={busy || remaining <= 0}>
                    <label
                        htmlFor={uploadId}
                        className={busy || remaining <= 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    >
                        {uploadMutation.isPending ? <Spinner /> : <ImagePlus />}
                        {remaining <= 0 ? "Límite de imágenes alcanzado" : "Subir imágenes"}
                    </label>
                </Button>
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                destructive
                title="¿Eliminar esta imagen?"
                description="La imagen se eliminará de forma permanente. Si el servicio está activo debe conservar al menos una."
                confirmLabel="Eliminar"
                loading={deleteMutation.isPending}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
