/** Etiquetas en español de las entidades y acciones de auditoría (valores del backend). */
export const AUDIT_ENTITY_LABELS: Record<string, string> = {
    USER: "Usuario",
    SERVICE: "Servicio",
    APPOINTMENT: "Cita",
    FAQ: "Pregunta frecuente",
    OFFER: "Oferta",
    CONSULTATION: "Consulta",
    PATIENT: "Paciente",
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
    USER_CREATED: "Usuario creado",
    USER_STATUS_CHANGED: "Estado de usuario cambiado",
    PASSWORD_CHANGED: "Contraseña cambiada",
    PASSWORD_RESET: "Contraseña restablecida",
    SERVICE_CREATED: "Servicio creado",
    SERVICE_STATUS_CHANGED: "Estado de servicio cambiado",
    APPOINTMENT_CREATED: "Cita creada",
    APPOINTMENT_CONFIRMED: "Cita confirmada",
    APPOINTMENT_CANCELLED: "Cita cancelada",
    APPOINTMENT_RESCHEDULED: "Cita reprogramada",
    APPOINTMENT_COMPLETED: "Cita completada",
    FAQ_CREATED: "Pregunta creada",
    FAQ_UPDATED: "Pregunta actualizada",
    FAQ_STATUS_CHANGED: "Estado de pregunta cambiado",
    FAQ_DELETED: "Pregunta eliminada",
    OFFER_CREATED: "Oferta creada",
    OFFER_UPDATED: "Oferta actualizada",
    OFFER_STATUS_CHANGED: "Estado de oferta cambiado",
    OFFER_DELETED: "Oferta eliminada",
    OFFER_IMAGE_SET: "Imagen de oferta guardada",
    OFFER_IMAGE_REMOVED: "Imagen de oferta eliminada",
    SERVICE_IMAGE_ADDED: "Imagen de servicio agregada",
    SERVICE_IMAGE_REPLACED: "Imagen de servicio reemplazada",
    SERVICE_IMAGE_DELETED: "Imagen de servicio eliminada",
    CONSULTATION_CREATED: "Consulta registrada",
    CONSULTATION_UPDATED: "Consulta actualizada",
    CONSULTATION_IMAGE_ADDED: "Imagen de consulta agregada",
    CONSULTATION_IMAGE_DELETED: "Imagen de consulta eliminada",
    PATIENT_PROFILE_UPDATED: "Perfil de paciente actualizado",
    PATIENT_UPDATED: "Paciente actualizado",
};

export const auditActionLabel = (action: string) => AUDIT_ACTION_LABELS[action] ?? action;
export const auditEntityLabel = (entity: string) => AUDIT_ENTITY_LABELS[entity] ?? entity;
