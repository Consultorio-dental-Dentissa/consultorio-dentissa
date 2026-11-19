import type {
    PatientAppointmentHistoryResponse,
    PatientConsultationHistoryResponse,
    PatientResponse,
} from "@/features/patients/types/patient.response";
import type {
    Patient,
    PatientAppointmentHistoryItem,
    PatientConsultationHistoryItem,
} from "@/features/patients/types/patient.model";

export function patientMap(patient: PatientResponse): Patient {
    return {
        id: patient.id,
        user_id: patient.user_id ?? null,
        name: patient.user.name,
        lastname: patient.user.lastname,
        email: patient.user.email,
        phone: patient.user.phone,
        status: patient.user.status,
        address: patient.address ?? null,
        birth_date: patient.birth_date ? new Date(patient.birth_date) : null,
        emergency_phone: patient.emergency_phone ?? null,
        next_appointment_at: patient.next_appointment_at ? new Date(patient.next_appointment_at) : null,
    };
}

export function patientAppointmentHistoryMap(
    item: PatientAppointmentHistoryResponse,
): PatientAppointmentHistoryItem {
    const start = new Date(item.scheduled_at);

    return {
        id: item.id,
        scheduled_at: start,
        scheduled_at_end: new Date(start.getTime() + item.durationMinutes * 60_000),
        durationMinutes: item.durationMinutes,
        status: item.status,
        notes: item.notes,
        cancel_reason: item.cancel_reason,
        service_name: item.service.name,
        has_consultation: item.consultation_id != null,
    };
}

export function patientConsultationHistoryMap(
    item: PatientConsultationHistoryResponse,
): PatientConsultationHistoryItem {
    return {
        id: item.id,
        appointment_id: item.appointment_id,
        scheduled_at: new Date(item.appointment.scheduled_at),
        service_name: item.appointment.service.name,
        description: item.description,
        observations: item.dentistObservations,
        images_count: item.images.length,
        images: item.images.map((image) => ({ id: image.id, path: image.url })),
    };
}
