/**
 * ============================================================================
 * CONTENIDO DE EJEMPLO: Luis lo cambiará.
 * ============================================================================
 * Todos los datos de este archivo son FICTICIOS y solo sirven para maquetar la
 * web pública (docs/DISEÑO-FINAL/Propuesta A - Sitio Web.dc.html). Reemplázalos por los datos
 * reales del consultorio. Los servicios, ofertas y preguntas frecuentes NO
 * viven aquí: se leen de la API (GET /services, /offers y /faq).
 */

import heroImage from "@/assets/logo-dentissa.png";

export interface TeamMember {
    name: string;
    role: string;
    description: string;
}

export interface Testimonial {
    name: string;
    text: string;
}

export interface SocialLink {
    id: "facebook" | "instagram" | "whatsapp";
    label: string;
    /** Deja la cadena vacía para ocultar la red social. */
    href: string;
}

export const clinicContent = {
    name: "Dentissa",
    slogan: "Sonrisas sanas, atención cálida",
    description: "Consultorio dental comprometido con tu sonrisa. Tecnología moderna y atención cálida.",
    address: "Av. Ejemplo 123, Col. Centro, Ciudad de México",
    phone: "55 0000 0000",
    email: "contacto@ejemplo-dentissa.mx",
    schedule: "Lun a Sáb · 9:00 – 20:00",
    /** Enlace al mapa (Google Maps, etc.). Vacío = no se muestra el botón. */
    mapUrl: "",
    /** URL de una foto propia del consultorio para el hero. Vacío = ilustración neutra. */
    heroImageUrl: heroImage,
    /** Mapa embebido de "Sobre nosotros": solo el valor de `src` del iframe de Google Maps ("Compartir > Incorporar un mapa"). */
    mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20513.357279094773!2d-102.2496466673532!3d17.97250139948458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x84315dffd396d683%3A0x262bf4998f94e994!2sDentiluna!5e0!3m2!1ses-419!2smx!4v1795050833347!5m2!1ses-419!2smx",
    /**
     * Cifras de "Sobre nosotros". Las de `key` "patients" y "treatments" se leen de la base de
     * datos (GET /public/stats); su `value` aquí es solo de relleno. Los años son EJEMPLO.
     */
    facts: [
        { key: "years", value: "15+", label: "Años de experiencia" },
        { key: "patients", value: "—", label: "Pacientes registrados" },
        { key: "treatments", value: "—", label: "Tratamientos" },
    ],
    /** EJEMPLO: pasos del bloque rosa de contacto. */
    bookingSteps: ["Crea tu cuenta", "Elige servicio, fecha y hora", "Recibe la confirmación"],
    socials: [
        { id: "facebook", label: "Facebook", href: "" },
        { id: "instagram", label: "Instagram", href: "" },
        { id: "whatsapp", label: "WhatsApp", href: "" },
    ] satisfies SocialLink[],
    team: [
        {
            name: "Dra. Ana Ejemplo",
            role: "Odontóloga general",
            description: "Atención integral y prevención para toda la familia.",
        },
        {
            name: "Dr. Carlos Muestra",
            role: "Ortodoncista",
            description: "Alineación dental con brackets y alineadores transparentes.",
        },
        {
            name: "Dra. Laura Demo",
            role: "Odontopediatra",
            description: "Cuidado dental amable para los más pequeños.",
        },
    ] satisfies TeamMember[],
    specialties: [
        "Odontología general",
        "Ortodoncia",
        "Endodoncia",
        "Odontopediatría",
        "Estética dental",
        "Rehabilitación",
    ],
    testimonials: [
        { name: "Paciente de ejemplo 1", text: "Me explicaron cada paso del tratamiento y me sentí con mucha confianza." },
        { name: "Paciente de ejemplo 2", text: "Agendar en línea fue muy sencillo y la atención fue puntual y amable." },
        { name: "Paciente de ejemplo 3", text: "Mis hijos ya no le tienen miedo al dentista. Muy recomendable." },
    ] satisfies Testimonial[],
} as const;
