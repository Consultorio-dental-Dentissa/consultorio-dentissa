import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { AlignLeft, Eye, HelpCircle, MessageCircleQuestion } from "lucide-react";
import { Modal } from "@/components/shared/modal.component";
import { Alert } from "@/components/shared/alert.component";
import { FormRow } from "@/components/shared/form-row.component";
import { FormRowInput, FormRowTextarea } from "@/components/shared/form-row-input.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useCreateFaq, useUpdateFaq, useUpdateFaqStatus } from "@/features/faq/hooks/use-faq";
import { FAQ_QUESTION_MAX, FAQ_RESPONSE_MAX, type Faq } from "@/features/faq/types/faq.model";
import { requiredText } from "@/utils/validation";

const schema = z.object({
    question: requiredText("La pregunta", FAQ_QUESTION_MAX),
    response: requiredText("La respuesta", FAQ_RESPONSE_MAX),
    status: z.boolean(),
});

type FormInput = z.infer<typeof schema>;

interface FaqFormModalProps {
    open: boolean;
    onClose: () => void;
    /** Pregunta a editar; sin ella el formulario crea una nueva. */
    faq?: Faq | null;
}

export function FaqFormModal({ open, onClose, faq }: FaqFormModalProps) {
    return (
        <Modal
            icon={HelpCircle}
            open={open}
            onClose={(value) => !value && onClose()}
            title={faq ? "Editar pregunta" : "Nueva pregunta"}
            description="Texto plano: se muestra tal cual en la sección pública de preguntas frecuentes."
        >
            {open && <FaqForm faq={faq ?? null} onClose={onClose} />}
        </Modal>
    );
}

function FaqForm({ faq, onClose }: { faq: Faq | null; onClose: () => void }) {
    const createMutation = useCreateFaq();
    const updateMutation = useUpdateFaq();
    const statusMutation = useUpdateFaqStatus();
    const [formError, setFormError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<FormInput>({
        resolver: zodResolver(schema),
        defaultValues: { question: faq?.question ?? "", response: faq?.response ?? "", status: faq?.status ?? true },
    });
    const status = useWatch({ control, name: "status" });
    const responseLength = useWatch({ control, name: "response" })?.length ?? 0;
    const busy = createMutation.isPending || updateMutation.isPending || statusMutation.isPending;

    const onSubmit = (data: FormInput) => {
        setFormError(null);
        const done = (message: string) => {
            toast.success(message);
            onClose();
        };
        const fail = (error: Error) => setFormError(error.message);

        if (!faq) {
            createMutation.mutate(data, { onSuccess: () => done("Pregunta creada"), onError: fail });
            return;
        }

        updateMutation.mutate(
            { id: faq.id, question: data.question, response: data.response },
            {
                onSuccess: () => {
                    if (data.status === faq.status) return done("Pregunta actualizada");
                    statusMutation.mutate(
                        { id: faq.id, status: data.status },
                        { onSuccess: () => done("Pregunta actualizada"), onError: fail },
                    );
                },
                onError: fail,
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <FormRowInput label="Pregunta" icon={MessageCircleQuestion} placeholder="Ej. ¿Aceptan pagos con tarjeta?" registration={register("question")} error={errors.question?.message} />
            <FormRowTextarea
                label="Respuesta" icon={AlignLeft} rows={4} maxLength={FAQ_RESPONSE_MAX} placeholder="Escribe la respuesta…"
                registration={register("response")} error={errors.response?.message}
                hint={<span aria-live="polite">{responseLength} / {FAQ_RESPONSE_MAX}</span>}
            />
            <FormRow label="Visibilidad" icon={Eye}>
                <label className="flex cursor-pointer items-center gap-3">
                    <Switch checked={status} onCheckedChange={(value) => setValue("status", value, { shouldDirty: true })} aria-label="Visible en el sitio público" />
                    <span className="text-[15px] text-ink-3">{status ? "Visible en el sitio público" : "Oculta"}</span>
                </label>
            </FormRow>

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button>
                <Button type="submit" disabled={busy}>
                    {busy && <Spinner />} {faq ? "Guardar cambios" : "Guardar pregunta"}
                </Button>
            </div>
        </form>
    );
}
