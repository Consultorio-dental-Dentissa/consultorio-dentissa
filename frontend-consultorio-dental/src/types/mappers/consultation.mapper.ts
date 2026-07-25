import type { ConsultationResponse } from "../api/responses/consultation.response";
import type { Consultation } from "../models/consultation";

export function consultationMap(consultation: ConsultationResponse): Consultation {
    return {
        id: consultation.id,
        notes: consultation.notes,
        observations: consultation.observations,
        created_at: new Date(consultation.created_at),
        appointment_id: consultation.appointment_id,
        scheduled_at: new Date(consultation.scheduled_at),
        patient: {
            name: consultation.patient.name,
            lastname: consultation.patient.lastname,
        },
        service: {
            name: consultation.service.name,
        },
    };
}
