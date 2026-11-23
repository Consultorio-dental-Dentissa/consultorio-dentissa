import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { AlignLeft, CalendarClock, NotebookPen, Pencil, Stethoscope, User } from "lucide-react";
import { Modal } from "@/components/shared/modal.component";
import { Alert } from "@/components/shared/alert.component";
import { FormRow } from "@/components/shared/form-row.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { FormRowTextarea } from "@/components/shared/form-row-input.component";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ConsultationImagesManager } from "@/features/consultations/components/consultation-images-manager.component";
import { useConsultation, useUpdateConsultation } from "@/features/consultations/hooks/use-consultations";
import { OdontogramSection } from "@/features/odontogram/components/odontogram-section.component";
import type { Consultation } from "@/features/consultations/types/consultation.model";
import { formatClinicShortDate } from "@/utils/clinic-time";

const MAX_TEXT = 50000;

const schema = z.object({
    description: z.string().trim().min(1, "La descripción es obligatoria").max(MAX_TEXT, `Máximo ${MAX_TEXT} caracteres`),
    observations: z.string().trim().max(MAX_TEXT, `Máximo ${MAX_TEXT} caracteres`),
});

type FormInput = z.infer<typeof schema>;

const SECTION_TITLE = "mb-2 text-sm font-extrabold tracking-[0.05em] text-ink-4 uppercase";
const READONLY = "flex min-h-[46px] items-center rounded-[9px] bg-field px-3.5 text-[15px] font-bold text-foreground";

interface ConsultationDetailModalProps {
    consultationId: number | null;
    onClose: () => void;
}

/** Detalle de la consulta (Consultas.dc.html): paciente, notas, observaciones, imágenes y edición. */
export function ConsultationDetailModal({ consultationId, onClose }: ConsultationDetailModalProps) {
    const query = useConsultation(consultationId);
    const [editingId, setEditingId] = useState<number | null>(null);
    const consultation = query.data;
    const editing = consultation !== undefined && editingId === consultation.id;

    return (
        <Modal
            open={consultationId !== null}
            onClose={(open) => {
                if (!open) {
                    setEditingId(null);
                    onClose();
                }
            }}
            title={editing ? "Editar consulta" : "Consulta"}
            size="lg"
        >
            {query.isPending && (
                <div className="flex flex-col gap-3" aria-busy="true">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}

            {query.isError && <ErrorState message={query.error.message} onRetry={() => query.refetch()} />}

            {consultation && (
                <div className="flex flex-col gap-5">
                    <FormRow label="Paciente" icon={User}>
                        <div className={READONLY}>{consultation.patient.name} {consultation.patient.lastname}</div>
                    </FormRow>
                    <FormRow label="Servicio" icon={Stethoscope}>
                        <div className={READONLY}>{consultation.service_name}</div>
                    </FormRow>
                    <FormRow label="Fecha" icon={CalendarClock}>
                        <div className={READONLY}>{formatClinicShortDate(consultation.scheduled_at)}</div>
                    </FormRow>

                    {editing ? (
                        <EditForm consultation={consultation} onDone={() => setEditingId(null)} />
                    ) : (
                        <>
                            <section>
                                <h3 className={SECTION_TITLE}>Notas de la consulta</h3>
                                <p className="text-[15px] leading-normal whitespace-pre-line text-ink-2">{consultation.description}</p>
                            </section>
                            <section>
                                <h3 className={SECTION_TITLE}>Observaciones</h3>
                                <p className="text-[15px] leading-normal whitespace-pre-line text-ink-2">
                                    {consultation.observations || "Sin observaciones."}
                                </p>
                            </section>
                        </>
                    )}

                    <section>
                        <h3 className={SECTION_TITLE}>Imágenes adjuntas ({consultation.images.length})</h3>
                        <ConsultationImagesManager consultation={consultation} editable />
                    </section>

                    <OdontogramSection patientId={consultation.patient.id} />

                    {!editing && (
                        <div className="form-footer">
                            <Button variant="outline" onClick={onClose}>Cerrar</Button>
                            <Button onClick={() => setEditingId(consultation.id)}>
                                <Pencil /> Editar consulta
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}

function EditForm({ consultation, onDone }: { consultation: Consultation; onDone: () => void }) {
    const mutation = useUpdateConsultation(consultation.id);
    const [formError, setFormError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormInput>({
        resolver: zodResolver(schema),
        defaultValues: { description: consultation.description, observations: consultation.observations },
    });

    const onSubmit = (data: FormInput) => {
        setFormError(null);
        mutation.mutate(
            { description: data.description, dentistObservations: data.observations },
            {
                onSuccess: () => {
                    toast.success("Consulta actualizada");
                    onDone();
                },
                onError: (error) => setFormError(error.message),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]" noValidate>
            {formError && <Alert>{formError}</Alert>}
            <FormRowTextarea label="Notas" icon={AlignLeft} rows={5} registration={register("description")} error={errors.description?.message} />
            <FormRowTextarea label="Observaciones" icon={NotebookPen} rows={3} registration={register("observations")} error={errors.observations?.message} />
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onDone} disabled={mutation.isPending}>Cancelar</Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Spinner />} Guardar cambios
                </Button>
            </div>
        </form>
    );
}
