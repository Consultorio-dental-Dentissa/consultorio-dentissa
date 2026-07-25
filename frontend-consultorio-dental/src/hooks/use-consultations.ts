import { useState } from "react";
import { createConsultation, getAllConsultations, updateConsultation } from "../services/consultations.service"

import type { CreateConsultationDto } from "../types/api/request/create-consultation.dto";
import type { UpdateConsultationDto } from "../types/api/request/update-consultation.dto";
import type { Consultation } from "@/types/models/consultation";

export function useConsultations() {

        const [consultations, setConsultations] = useState<Consultation[]>([]);
        const [isLoading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        async function useGetAllConsultations() {
                setError(null);
                setLoading(true);

                try {
                        const consultationsData = await getAllConsultations();
                        setConsultations(consultationsData);

                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                } finally {
                        setLoading(false);
                }
        }

        async function useCreateConsultation(newConsultation: CreateConsultationDto): Promise<Consultation | null> {
                setError(null);
                setLoading(true);

                try {
                        const consultationCreated = await createConsultation(newConsultation);
                        return consultationCreated;

                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                        return null;

                } finally {
                        setLoading(false);
                }
        }

        async function useUpdateConsultation(id: number, updatedConsultation: UpdateConsultationDto): Promise<Consultation | null> {
                setError(null);
                setLoading(true);

                try {
                        const consultationUpdated = await updateConsultation(id, updatedConsultation);
                        setConsultations(prev => prev.map(consultation => consultation.id === id ? consultationUpdated : consultation));
                        return consultationUpdated;

                } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        setError(errorMessage);
                        return null;

                } finally {
                        setLoading(false);
                }
        }

        return {
                consultations,
                useGetAllConsultations,
                useCreateConsultation,
                useUpdateConsultation,
                isLoading,
                error
        }
}
