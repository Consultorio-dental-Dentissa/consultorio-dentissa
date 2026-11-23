import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Modal } from "@/components/shared/modal.component";
import { Alert } from "@/components/shared/alert.component";
import { FieldError } from "@/components/shared/input.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTooth } from "@/features/odontogram/hooks/use-odontogram";
import {
    MAX_TOOTH_NOTES, TOOTH_STATUS_LIST, TOOTH_STATUS_STYLE, type Tooth, type ToothStatus,
} from "@/features/odontogram/types/odontogram.model";

const schema = z.object({
    status: z.enum(["SANO", "CARIES", "REMOVIDO", "CORONA"], { message: "Selecciona un estado" }),
    notes: z.string().trim().max(MAX_TOOTH_NOTES, `Máximo ${MAX_TOOTH_NOTES} caracteres`),
});

type FormInput = z.infer<typeof schema>;

interface ToothEditModalProps {
    patientId: number;
    /** Diente a editar; `null` mantiene el modal cerrado. */
    tooth: Tooth | null;
    onClose: () => void;
}

export function ToothEditModal({ patientId, tooth, onClose }: ToothEditModalProps) {
    return (
        <Modal
            open={tooth !== null}
            onClose={(open) => !open && onClose()}
            title={tooth ? `Diente ${tooth.tooth_number}` : "Diente"}
            description="Cambia el estado del diente y agrega una nota"
            size="sm"
        >
            {tooth && <ToothForm key={tooth.tooth_number} patientId={patientId} tooth={tooth} onClose={onClose} />}
        </Modal>
    );
}

function ToothForm({ patientId, tooth, onClose }: { patientId: number; tooth: Tooth; onClose: () => void }) {
    const mutation = useUpdateTooth(patientId);
    const [formError, setFormError] = useState<string | null>(null);
    const notesId = useId();
    const errorId = `${notesId}-error`;

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormInput>({
        resolver: zodResolver(schema),
        defaultValues: { status: tooth.status, notes: tooth.notes ?? "" },
    });

    const notesLength = (useWatch({ control, name: "notes" }) ?? "").length;

    const onSubmit = (data: FormInput) => {
        setFormError(null);

        if (data.status === tooth.status && data.notes === (tooth.notes ?? "")) {
            toast("No hay cambios para guardar");
            return;
        }

        mutation.mutate(
            { toothNumber: tooth.tooth_number, status: data.status, notes: data.notes },
            {
                onSuccess: () => {
                    toast.success(`Diente ${tooth.tooth_number} actualizado`);
                    onClose();
                },
                onError: (error) => setFormError(error.message),
            },
        );
    };

    return (
        <form
            onSubmit={(event) => {
                // El modal puede renderizarse dentro de otro formulario (React propaga eventos por portales).
                event.stopPropagation();
                void handleSubmit(onSubmit)(event);
            }}
            className="flex flex-col gap-[18px]" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <Controller
                control={control}
                name="status"
                render={({ field }) => (
                    <fieldset className="flex flex-col gap-2">
                        <legend className="mb-2 text-[14.5px] font-bold text-ink-2">Estado</legend>
                        <div className="grid grid-cols-2 gap-2">
                            {TOOTH_STATUS_LIST.map((status) => (
                                <StatusOption
                                    key={status}
                                    status={status}
                                    checked={field.value === status}
                                    onSelect={() => field.onChange(status)}
                                    disabled={mutation.isPending}
                                />
                            ))}
                        </div>
                        <FieldError id={`${notesId}-status-error`} message={errors.status?.message} />
                    </fieldset>
                )}
            />

            <div className="flex flex-col gap-1.5">
                <label htmlFor={notesId} className="text-[14.5px] font-bold text-ink-2">Nota</label>
                <Textarea
                    id={notesId}
                    rows={3}
                    maxLength={MAX_TOOTH_NOTES}
                    placeholder="Observaciones del diente (opcional)"
                    aria-invalid={errors.notes ? true : undefined}
                    aria-describedby={errors.notes ? errorId : undefined}
                    disabled={mutation.isPending}
                    {...register("notes")}
                />
                <div className="flex items-start justify-between gap-3">
                    <FieldError id={errorId} message={errors.notes?.message} />
                    <p className="ml-auto text-[13.5px] text-ink-4" aria-live="polite">{notesLength}/{MAX_TOOTH_NOTES}</p>
                </div>
            </div>

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancelar</Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Spinner />} Guardar
                </Button>
            </div>
        </form>
    );
}

function StatusOption({ status, checked, onSelect, disabled }: {
    status: ToothStatus; checked: boolean; onSelect: () => void; disabled: boolean;
}) {
    const style = TOOTH_STATUS_STYLE[status];

    return (
        <label
            className={`flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-[9px] border px-3 text-[15px] font-bold text-ink-2 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30 ${
                checked ? "border-primary bg-brand-soft" : "border-input bg-surface hover:bg-field"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
            <input
                type="radio"
                name="tooth-status"
                value={status}
                checked={checked}
                onChange={onSelect}
                disabled={disabled}
                className="sr-only"
            />
            <span
                aria-hidden="true"
                className="size-5 shrink-0 rounded-full border-2"
                style={{ backgroundColor: style.fill, borderColor: style.stroke }}
            />
            {style.label}
        </label>
    );
}
