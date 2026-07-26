import { useState } from "react";
import { getOdontogramByPatientId, updateTooth } from "../services/odontograms.service";

import type { UpdateToothDto } from "../types/api/request/update-tooth.dto";
import type { Odontogram } from "@/types/models/odontogram";

export function useOdontogram() {

        const [odontogram, setOdontogram] = useState<Odontogram | null>(null);
        const [isLoading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        async function useGetOdontogramByPatientId(patientId: number) {
                setError(null);
                setLoading(true);

                try {
                        const odontogramData = await getOdontogramByPatientId(patientId);
                        setOdontogram(odontogramData);

                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);

                } finally {
                        setLoading(false);
                }
        }

        async function useUpdateTooth(id: number, updatedTooth: UpdateToothDto) {
                setError(null);
                setLoading(true);

                try {
                        const toothUpdated = await updateTooth(id, updatedTooth);

                        setOdontogram(prev => prev && {
                                ...prev,
                                teeth: prev.teeth.map(tooth => tooth.id === id ? toothUpdated : tooth)
                        });

                        return toothUpdated;

                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                        return null;

                } finally {
                        setLoading(false);
                }
        }

        return {
                odontogram,
                useGetOdontogramByPatientId,
                useUpdateTooth,
                isLoading,
                error
        }
}
