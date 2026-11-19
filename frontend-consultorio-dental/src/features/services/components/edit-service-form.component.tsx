import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { AlignLeft, Clock, DollarSign, Tag } from "lucide-react";
import { FormRowInput, FormRowTextarea } from "@/components/shared/form-row-input.component";
import { Alert } from "@/components/shared/alert.component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateService } from "@/features/services/hooks/use-services";
import { requiredText } from "@/utils/validation";
import type { Service } from "@/features/services/types/service.model";
import type { UpdateServiceDto } from "@/features/services/types/update-service.dto";

const MIN_DURATION = 15;
const MAX_DURATION = 120;

const schema = z.object({
    name: requiredText("El nombre", 100),
    price: z
        .string()
        .trim()
        .min(1, "El precio es obligatorio")
        .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Ingresa un precio válido")
        .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Usa máximo 2 decimales"),
    durationMinutes: z
        .string()
        .trim()
        .min(1, "La duración es obligatoria")
        .refine((v) => /^\d+$/.test(v), "Ingresa minutos enteros")
        .refine(
            (v) => Number(v) >= MIN_DURATION && Number(v) <= MAX_DURATION,
            `La duración debe estar entre ${MIN_DURATION} y ${MAX_DURATION} minutos`,
        ),
    description: requiredText("La descripción", 300),
});

type EditInput = z.infer<typeof schema>;

interface EditServiceFormProps {
    service: Service;
    onSuccess: () => void;
    onCancel: () => void;
}

export function EditServiceForm({ service, onSuccess, onCancel }: EditServiceFormProps) {
    const mutation = useUpdateService(service.id);
    const [formError, setFormError] = useState<string | null>(null);

    const initial: EditInput = {
        name: service.name,
        price: String(Number(service.price)),
        durationMinutes: String(service.durationMinutes),
        description: service.description,
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EditInput>({ resolver: zodResolver(schema), defaultValues: initial });

    const onSubmit = (data: EditInput) => {
        setFormError(null);

        // PATCH parcial: solo los campos modificados
        const changes: UpdateServiceDto = {};
        if (data.name !== initial.name) changes.name = data.name;
        if (data.description !== initial.description) changes.description = data.description;
        if (Number(data.price) !== Number(initial.price)) changes.price = Number(data.price);
        if (Number(data.durationMinutes) !== Number(initial.durationMinutes)) {
            changes.durationMinutes = Number(data.durationMinutes);
        }

        if (Object.keys(changes).length === 0) {
            toast("No hay cambios para guardar");
            return;
        }

        mutation.mutate(changes, {
            onSuccess: () => {
                toast.success("Servicio actualizado correctamente");
                onSuccess();
            },
            onError: (error) => setFormError(error.message),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]" noValidate>
            {formError && <Alert>{formError}</Alert>}

            <FormRowInput label="Nombre" icon={Tag} placeholder="Ej. Limpieza dental" registration={register("name")} error={errors.name?.message} />
            <FormRowInput
                label="Precio (MXN)" icon={DollarSign} type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00"
                registration={register("price")} error={errors.price?.message}
            />
            <FormRowInput
                label="Duración (min)" icon={Clock} type="number" step="5" min={String(MIN_DURATION)} max={String(MAX_DURATION)}
                inputMode="numeric"
                hint={`Entre ${MIN_DURATION} y ${MAX_DURATION} minutos.`}
                registration={register("durationMinutes")} error={errors.durationMinutes?.message}
            />
            <FormRowTextarea
                label="Descripción" icon={AlignLeft} rows={3} maxLength={300} placeholder="Describe el tratamiento"
                registration={register("description")} error={errors.description?.message}
            />

            <div className="form-footer">
                <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Spinner />} Guardar cambios
                </Button>
            </div>
        </form>
    );
}
