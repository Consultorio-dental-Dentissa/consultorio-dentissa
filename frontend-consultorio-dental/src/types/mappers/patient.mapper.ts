import type { PatientResponse } from "../api/responses/patient.response";
import type { Patient } from "../models/patient";

export function patientMap(patient: PatientResponse): Patient {
    return {
        id: patient.id,
        address: patient.address,
        birth_date: new Date(patient.birth_date),
        emergency_phone: patient.emergency_phone,
        name: patient.user.name,
        lastname: patient.user.lastname,
        email: patient.user.email,
        phone: patient.user.phone
    }
}