import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOdontogram, updateTooth } from "@/features/odontogram/services/odontogram.service";
import type { Odontogram } from "@/features/odontogram/types/odontogram.model";
import type { UpdateToothDto } from "@/features/odontogram/types/odontogram.response";

const odontogramKey = (patientId: number) => ["odontogram", patientId] as const;

export function useOdontogram(patientId: number, enabled = true) {
    return useQuery({
        queryKey: odontogramKey(patientId),
        queryFn: () => getOdontogram(patientId),
        enabled,
    });
}

export function useUpdateTooth(patientId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ toothNumber, ...dto }: UpdateToothDto & { toothNumber: number }) =>
            updateTooth(patientId, toothNumber, dto),
        onSuccess: (tooth) => {
            // Refleja el cambio al instante en todas las vistas abiertas y luego confirma con el servidor.
            queryClient.setQueryData<Odontogram>(odontogramKey(patientId), (current) =>
                current
                    ? { ...current, teeth: current.teeth.map((t) => (t.tooth_number === tooth.tooth_number ? tooth : t)) }
                    : current,
            );
            queryClient.invalidateQueries({ queryKey: odontogramKey(patientId) });
            queryClient.invalidateQueries({ queryKey: ["audit"] });
        },
    });
}
