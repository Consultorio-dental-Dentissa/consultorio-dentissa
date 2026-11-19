import type { ConsultationResponse } from "@/features/consultations/types/consultation.response";
import type { Consultation } from "@/features/consultations/types/consultation.model";

export function consultationMap(response: ConsultationResponse): Consultation {
    return {
        id: response.id,
        appointment_id: response.appointment_id,
        description: response.description,
        observations: response.dentistObservations ?? "",
        created_at: new Date(response.created_at),
        updated_at: new Date(response.updated_at),
        scheduled_at: new Date(response.appointment.scheduled_at),
        service_name: response.appointment.service.name,
        patient: response.patient,
        images: response.images.map((image) => ({ id: image.id, path: image.url })),
    };
}
