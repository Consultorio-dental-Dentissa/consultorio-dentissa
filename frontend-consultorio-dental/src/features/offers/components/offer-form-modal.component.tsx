import { useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { AlignLeft, CalendarDays, CalendarX, CheckCircle2, ImagePlus, Stethoscope, Tag, Trash2, X } from "lucide-react";
import { Modal } from "@/components/shared/modal.component";
import { Alert } from "@/components/shared/alert.component";
import { ConfirmDialog } from "@/components/shared/confirm-dialog.component";
import { FormRow } from "@/components/shared/form-row.component";
import { FormRowInput, FormRowTextarea } from "@/components/shared/form-row-input.component";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { OfferImage } from "@/features/offers/components/offer-image.component";
import {
    useCreateOffer, useDeleteOfferImage, useSetOfferImage, useUpdateOffer, useUpdateOfferStatus,
} from "@/features/offers/hooks/use-offers";
import { useActiveServices } from "@/features/services/hooks/use-services";
import { ACCEPTED_IMAGE_TYPES, validateImageFiles } from "@/features/consultations/types/image-files";
import { clinicTodayKey } from "@/utils/clinic-time";
import { requiredText } from "@/utils/validation";
import type { Offer } from "@/features/offers/types/offer.model";

const schema = z
    .object({
        name: requiredText("El título", 150),
        description: requiredText("La descripción", 1000),
        start_date: z.string().min(1, "Selecciona la fecha de inicio"),
        end_date: z.string().min(1, "Selecciona la fecha de fin"),
        status: z.boolean(),
        serviceIds: z.array(z.number()),
    })
    .refine((data) => !data.start_date || !data.end_date || data.end_date >= data.start_date, {
        path: ["end_date"],
        message: "La fecha de fin no puede ser anterior a la de inicio",
    });

type FormInput = z.infer<typeof schema>;

interface OfferFormModalProps {
    open: boolean;
    onClose: () => void;
    /** Oferta a editar; sin ella el formulario crea una nueva. */
    offer?: Offer | null;
}

export function OfferFormModal({ open, onClose, offer }: OfferFormModalProps) {
    return (
        <Modal
            icon={Tag}
            open={open}
            onClose={(value) => !value && onClose()}
            title={offer ? "Editar oferta" : "Nueva oferta"}
            description="Las ofertas activas y vigentes se muestran en el sitio público"
            size="lg"
        >
            {open && <OfferForm offer={offer ?? null} onClose={onClose} />}
        </Modal>
    );
}

function OfferForm({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
    const fileInputId = useId();
    const createMutation = useCreateOffer();
    const updateMutation = useUpdateOffer();
    const statusMutation = useUpdateOfferStatus();
    const imageMutation = useSetOfferImage();
    const removeImageMutation = useDeleteOfferImage();
    const servicesQuery = useActiveServices();

    const [formError, setFormError] = useState<string | null>(null);
    const [pendingImage, setPendingImage] = useState<File | null>(null);
    const [confirmRemove, setConfirmRemove] = useState(false);

    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<FormInput>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: offer?.name ?? "",
            description: offer?.description ?? "",
            start_date: offer?.start_date ?? clinicTodayKey(),
            end_date: offer?.end_date ?? "",
            status: offer?.status ?? false,
            serviceIds: offer?.services.map((service) => service.id) ?? [],
        },
    });
    const status = useWatch({ control, name: "status" });
    const selected = useWatch({ control, name: "serviceIds" });
    const busy = createMutation.isPending || updateMutation.isPending || statusMutation.isPending || imageMutation.isPending;

    // Servicios activos + los ya asociados a la oferta (aunque hoy estén inactivos) para poder quitarlos.
    const options = new Map<number, { id: number; name: string; inactive: boolean }>();
    for (const service of servicesQuery.data ?? []) options.set(service.id, { id: service.id, name: service.name, inactive: false });
    for (const service of offer?.services ?? []) {
        if (!options.has(service.id)) options.set(service.id, { id: service.id, name: service.name, inactive: true });
    }

    const toggleService = (id: number, checked: boolean) =>
        setValue("serviceIds", checked ? [...selected, id] : selected.filter((value) => value !== id), { shouldDirty: true });

    const pickImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        const invalid = validateImageFiles([file]);
        setFormError(invalid);
        if (invalid) return;

        if (!offer) {
            setPendingImage(file);
            return;
        }
        imageMutation.mutate(
            { id: offer.id, file },
            {
                onSuccess: () => toast.success("Imagen de la oferta actualizada"),
                onError: (error) => setFormError(error.message),
            },
        );
    };

    const removeImage = () => {
        if (!offer) return;
        removeImageMutation.mutate(offer.id, {
            onSuccess: () => {
                toast.success("Imagen eliminada");
                setConfirmRemove(false);
            },
            onError: (error) => {
                setFormError(error.message);
                setConfirmRemove(false);
            },
        });
    };

    const finish = (message: string) => {
        toast.success(message);
        onClose();
    };
    const fail = (error: Error) => setFormError(error.message);

    const onSubmit = (data: FormInput) => {
        setFormError(null);
        const dto = {
            name: data.name,
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date,
            serviceIds: data.serviceIds,
        };

        if (!offer) {
            createMutation.mutate(
                { ...dto, status: data.status },
                {
                    onSuccess: (created) => {
                        if (!pendingImage) return finish("Oferta creada");
                        imageMutation.mutate(
                            { id: created.id, file: pendingImage },
                            {
                                onSuccess: () => finish("Oferta creada con su imagen"),
                                onError: (error) => {
                                    toast.error(`La oferta se creó, pero no se pudo subir la imagen: ${error.message}`, { duration: 7000 });
                                    onClose();
                                },
                            },
                        );
                    },
                    onError: fail,
                },
            );
            return;
        }

        updateMutation.mutate(
            { id: offer.id, ...dto },
            {
                onSuccess: () => {
                    if (data.status === offer.status) return finish("Oferta actualizada");
                    statusMutation.mutate(
                        { id: offer.id, status: data.status },
                        { onSuccess: () => finish("Oferta actualizada"), onError: fail },
                    );
                },
                onError: fail,
            },
        );
    };

    const imagePending = imageMutation.isPending || removeImageMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <FormRowInput label="Título" icon={Tag} placeholder="Ej. 20% en limpieza dental" registration={register("name")} error={errors.name?.message} />
            <FormRowTextarea label="Descripción" icon={AlignLeft} rows={3} maxLength={1000} registration={register("description")} error={errors.description?.message} />
            <FormRowInput label="Inicio" icon={CalendarDays} type="date" registration={register("start_date")} error={errors.start_date?.message} />
            <FormRowInput label="Fin" icon={CalendarX} type="date" registration={register("end_date")} error={errors.end_date?.message} />

            <FormRow label="Servicios" icon={Stethoscope} align="top">
                <div role="group" aria-label="Servicios incluidos" className="flex flex-col gap-1.5">
                    {servicesQuery.isError && <Alert>No pudimos cargar los servicios: {servicesQuery.error.message}</Alert>}
                    {servicesQuery.isPending ? (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> Cargando servicios...</p>
                    ) : options.size === 0 ? (
                        <p className="text-sm font-medium text-muted-foreground">No hay servicios activos para asociar.</p>
                    ) : (
                        <ul className="grid max-h-[168px] gap-1 overflow-y-auto rounded-[9px] border border-input p-2 sm:grid-cols-2">
                            {[...options.values()].map((service) => (
                                <li key={service.id}>
                                    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-surface-muted">
                                        <Checkbox
                                            checked={selected.includes(service.id)}
                                            onCheckedChange={(checked) => toggleService(service.id, checked === true)}
                                        />
                                        <span className="min-w-0 truncate">{service.name}</span>
                                        {service.inactive && <span className="text-xs font-bold text-ink-4">(inactivo)</span>}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </FormRow>

            <FormRow label="Imagen" icon={ImagePlus} htmlFor={fileInputId} align="top">
                <div className="flex items-center gap-3 rounded-[9px] border border-line-soft bg-surface-muted p-3">
                    {offer ? (
                        <OfferImage path={offer.image_path} alt={`Imagen de ${offer.name}`} className="size-16 shrink-0 rounded-lg border border-line" />
                    ) : (
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-line bg-brand-soft text-brand" aria-hidden="true">
                            <Tag className="size-6" />
                        </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                        {!offer && pendingImage && (
                            <p className="flex max-w-full items-center gap-1 text-xs font-semibold text-ink-3">
                                <span className="truncate">{pendingImage.name}</span>
                                <button type="button" onClick={() => setPendingImage(null)} aria-label="Quitar la imagen seleccionada" className="rounded text-ink-4 hover:text-ink-2">
                                    <X className="size-3.5" />
                                </button>
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <input id={fileInputId} type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} className="sr-only" onChange={pickImage} disabled={busy || imagePending} />
                            <Button asChild variant="outline" size="sm">
                                <label htmlFor={fileInputId} className={busy || imagePending ? "pointer-events-none opacity-50" : "cursor-pointer"}>
                                    {imageMutation.isPending ? <Spinner /> : <ImagePlus />}
                                    {offer?.image_path || pendingImage ? "Cambiar imagen" : "Subir imagen"}
                                </label>
                            </Button>
                            {offer?.image_path && (
                                <Button type="button" variant="dangerOutline" size="sm" onClick={() => setConfirmRemove(true)} disabled={busy || imagePending}>
                                    <Trash2 /> Quitar
                                </Button>
                            )}
                        </div>
                        <p className="text-[13.5px] text-ink-4">Opcional, una por oferta. JPG, PNG o WebP de hasta 5 MB.</p>
                    </div>
                </div>
            </FormRow>

            <FormRow label="Estatus" icon={CheckCircle2}>
                <label className="flex cursor-pointer items-center gap-3">
                    <Switch checked={status} onCheckedChange={(value) => setValue("status", value, { shouldDirty: true })} aria-label="Oferta activa" />
                    <span className="text-[15px] text-ink-3">{status ? "Activa (visible dentro de su vigencia)" : "Inactiva"}</span>
                </label>
            </FormRow>

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button>
                <Button type="submit" disabled={busy}>
                    {busy && <Spinner />} {offer ? "Guardar cambios" : "Crear oferta"}
                </Button>
            </div>

            <ConfirmDialog
                open={confirmRemove}
                onOpenChange={setConfirmRemove}
                destructive
                title="¿Quitar la imagen?"
                description="La imagen se eliminará de forma permanente. La oferta seguirá existiendo sin imagen."
                confirmLabel="Quitar imagen"
                loading={removeImageMutation.isPending}
                onConfirm={removeImage}
            />
        </form>
    );
}
