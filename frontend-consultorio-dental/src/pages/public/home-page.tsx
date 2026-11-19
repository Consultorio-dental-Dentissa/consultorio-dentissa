import {
    AboutSection,
    ContactSection,
    FaqSection,
    HeroSection,
    ServicesSection,
} from "@/features/public/components/public-sections";

/** Inicio: réplica de docs/DISEÑO-FINAL/Propuesta A - Sitio Web.dc.html (hero, nosotros, servicios, FAQ, contacto). */
export default function HomePage() {
    return (
        <>
            <HeroSection />
            <AboutSection />
            <ServicesSection />
            <FaqSection limit={6} />
            <ContactSection />
        </>
    );
}
