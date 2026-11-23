import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { AlignLeft, CalendarCheck, FileText, ImagePlus, NotebookPen, Smile, X } from "lucide-react";
import { Modal } from "@/components/shared/modal.component";
import { Alert } from "@/components/shared/alert.component";
import { FormRow } from "@/components/shared/form-row.component";
import { FormRowSelect, FormRowTextarea } from "@/components/shared/form-row-input.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ImageDropzone } from "@/features/consultations/components/image-dropzone.component";
import { validateImageFiles } from "@/features/consultations/types/image-files";
import { useCreateConsultation, useUploadConsultationImages } from "@/features/consultations/hooks/use-consultations";
import { MAX_CONSULTATION_IMAGES } from "@/features/consultations/types/consultation.model";
import { useAppointment, useAppointments } from "@/features/appointments/hooks/use-appointments";
import { STATUS_APPOINTMENT } from "@/features/appointments/types/status-appointment.enum";
import { Odontogram } from "@/features/odontogram/components/odontogram.component";
import { formatClinicShortDate } from "@/utils/clinic-time";

const MAX_TEXT = 50000;

const schema = z.object({
    appointment_id: z.string().min(1, "Selecciona la cita completada"),
    description: z.string().trim().min(1, "Describe el procedimiento realizado").max(MAX_TEXT, `Máximo ${MAX_TEXT} caracteres`),
    observations: z.string().trim().max(MAX_TEXT, `Máximo ${MAX_TEXT} caracteres`),
});

type FormInput = z.infer<typeof schema>;

export interface ConsultationAppointment {
    id: number;
    /** Paciente de la cita (para mostrar su odontograma). */
    patient_id: number;
    /** Texto para mostrar, p. ej. "María Ramírez · Limpieza dental · 10 jul 2025". */
    label: string;
}

interface CreateConsultationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Cita ya elegida (acción "Registrar consulta" desde la cita); si falta se muestra el selector. */
    appointment?: ConsultationAppointment;
    onCreated?: (consultationId: number) => void;
}

/** "Registrar consulta" (Consultas.dc.html): vinculada a una cita completada, con imágenes opcionales. */
export function CreateConsultationModal({ open, onOpenChange, appointment, onCreated }: CreateConsultationModalProps) {
    return (
        <Modal
            icon={FileText}
            open={open}
            onClose={onOpenChange}
            title="Registrar consulta"
            description="Vinculada a una cita completada"
            size="xl"
        >
            <CreateForm appointment={appointment} onClose={() => onOpenChange(false)} onCreated={onCreated} />
        </Modal>
    );
}

function CreateForm({ appointment, onClose, onCreated }: { appointment?: ConsultationAppointment; onClose: () => void; onCreated?: (id: number) => void }) {
    const createMutation = useCreateConsultation();
    const uploadMutation = useUploadConsultationImages();
    const [files, setFiles] = useState<File[]>([]);
    const [formError, setFormError] = useState<string | null>(null);

    // Solo se necesita cuando no llega una cita ya elegida.
    const completed = useAppointments(
        { status: STATUS_APPOINTMENT.COMPLETADA, completed_without_consultation: true, limit: 100, sort: "desc" },
        appointment === undefined,
    );

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormInput>({
        resolver: zodResolver(schema),
        defaultValues: { appointment_id: appointment ? String(appointment.id) : "", description: "", observations: "" },
    });

    // La lista de citas no trae patient_id: se obtiene del detalle de la cita elegida.
    const selectedId = useWatch({ control, name: "appointment_id" });
    const detail = useAppointment(appointment ? null : selectedId ? Number(selectedId) : null);
    const patientId = appointment ? appointment.patient_id : detail.data?.patient_id ?? null;

    const addFiles = (incoming: File[]) => {
        if (files.length + incoming.length > MAX_CONSULTATION_IMAGES) {
            setFormError(`Solo puedes adjuntar hasta ${MAX_CONSULTATION_IMAGES} imágenes.`);
            return;
        }
        const invalid = validateImageFiles(incoming);
        setFormError(invalid);
        if (!invalid) setFiles((current) => [...current, ...incoming]);
    };

    const onSubmit = (data: FormInput) => {
        setFormError(null);

        createMutation.mutate(
            {
                appointment_id: Number(data.appointment_id),
                description: data.description,
                dentistObservations: data.observations || undefined,
            },
            {
                onSuccess: (consultation) => {
                    onCreated?.(consultation.id);

                    if (files.length === 0) {
                        toast.success("Consulta registrada");
                        onClose();
                        return;
                    }

                    // La consulta ya existe: si fallan las imágenes se puede reintentar desde su detalle.
                    uploadMutation.mutate(
                        { consultationId: consultation.id, files },
                        {
                            onSuccess: () => toast.success("Consulta registrada con sus imágenes"),
                            onError: (error) =>
                                toast.error(`La consulta se guardó, pero no se pudieron subir las imágenes: ${error.message}`, { duration: 7000 }),
                            onSettled: onClose,
                        },
                    );
                },
                onError: (error) => setFormError(error.message),
            },
        );
    };

    const busy = createMutation.isPending || uploadMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]" noValidate>
            {formError && <Alert>{formError}</Alert>}

            {appointment ? (
                <FormRow label="Cita" icon={CalendarCheck} stacked>
                    <p className="flex min-h-[46px] items-center rounded-[9px] bg-field px-3.5 text-[15px] font-bold text-foreground">{appointment.label}</p>
                </FormRow>
            ) : (
                <>
                    {completed.isError && <Alert>No pudimos cargar las citas completadas: {completed.error.message}</Alert>}
                    <Controller
                        control={control}
                        name="appointment_id"
                        render={({ field }) => (
                            <FormRowSelect
                                label="Cita" icon={CalendarCheck} stacked
                                placeholder={completed.isPending ? "Cargando citas..." : "Selecciona la cita"}
                                data={(completed.data?.items ?? []).map((item) => ({
                                    value: item.id,
                                    data: `${item.patient.name} ${item.patient.lastname} · ${item.service.name} · ${formatClinicShortDate(item.scheduled_at)}`,
                                }))}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.appointment_id?.message}
                                hint={completed.data && completed.data.items.length === 0 ? "No hay citas completadas sin consulta." : "Solo se muestran citas completadas que aún no tienen consulta (las 100 más recientes)."}
                            />
                        )}
                    />
                </>
            )}

            <FormRowTextarea label="Notas" icon={AlignLeft} stacked rows={4} placeholder="Describe el procedimiento realizado…" registration={register("description")} error={errors.description?.message} />
            <FormRowTextarea label="Observaciones" icon={NotebookPen} stacked rows={3} placeholder="Indicaciones y seguimiento…" registration={register("observations")} error={errors.observations?.message} />

            <FormRow label="Imágenes" icon={ImagePlus} align="top" stacked>
                <div className="flex flex-col gap-2">
                    <ImageDropzone onFiles={addFiles} disabled={busy} remaining={MAX_CONSULTATION_IMAGES - files.length} />
                    {files.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5" aria-label="Imágenes por subir">
                            {files.map((file, index) => (
                                <li key={`${file.name}-${index}`} className="flex items-center gap-1 rounded-md bg-brand-soft py-1 pr-1 pl-2 text-xs font-semibold text-brand">
                                    <span className="max-w-[180px] truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                                        aria-label={`Quitar ${file.name}`}
                                        disabled={busy}
                                        className="flex size-5 items-center justify-center rounded outline-none hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-ring/50"
                                    >
                                        <X className="size-3" aria-hidden="true" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </FormRow>

            {/* Odontograma al final, con su etiqueta arriba (ocupa todo el ancho del formulario). */}
            {patientId !== null && (
                <div role="group" aria-labelledby="consultation-odontogram-label" className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <span id="consultation-odontogram-label" className="flex items-center gap-[11px] text-[15px] font-semibold text-ink-4">
                            <Smile className="size-[19px] shrink-0 text-ink-5" strokeWidth={1.9} aria-hidden="true" />
                            Odontograma del paciente
                        </span>
                        <p className="text-sm text-ink-4">
                            Cada cambio en un diente se guarda al instante; es independiente de guardar la consulta.
                        </p>
                    </div>
                    <Odontogram patientId={patientId} legendPosition="top" />
                </div>
            )}

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button>
                <Button type="submit" disabled={busy}>
                    {busy && <Spinner />} Guardar consulta
                </Button>
            </div>
        </form>
    );
}
