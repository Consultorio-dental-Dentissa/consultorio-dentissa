import { clinicContent } from "@/config/clinic-content";
import { AboutSection } from "@/features/public/components/public-sections";
import { PublicSection, SectionIntro } from "@/features/public/components/public-ui";

/**
 * Sobre nosotros: la sección de la maqueta más equipo, especialidades y testimonios.
 * Equipo, especialidades y testimonios son contenido de EJEMPLO (src/config/clinic-content.ts).
 */
export default function AboutUsPage() {
    return (
        <>
            <AboutSection heading="h1" />

            <PublicSection>
                <SectionIntro eyebrow="Nuestro equipo" title="Profesionales que cuidan de ti" />
                <ul className="mt-11 grid gap-6 md:grid-cols-3">
                    {clinicContent.team.map((member) => (
                        <li key={member.name} className="rounded-[14px] border border-line bg-surface p-[26px]">
                            <h3 className="text-[21px] font-extrabold">{member.name}</h3>
                            <p className="mt-1 text-[15px] font-bold text-brand">{member.role}</p>
                            <p className="mt-2 text-base leading-[1.55] text-ink-3">{member.description}</p>
                        </li>
                    ))}
                </ul>
            </PublicSection>

            <PublicSection muted>
                <SectionIntro eyebrow="Especialidades" title="Todo lo que tu sonrisa necesita" />
                <ul className="mt-9 flex flex-wrap justify-center gap-3">
                    {clinicContent.specialties.map((name) => (
                        <li key={name} className="rounded-full border border-line bg-surface px-5 py-2.5 text-[15px] font-bold text-ink-2">
                            {name}
                        </li>
                    ))}
                </ul>
            </PublicSection>

            <PublicSection>
                <SectionIntro eyebrow="Testimonios" title="Lo que dicen nuestros pacientes" />
                <ul className="mt-11 grid gap-6 md:grid-cols-3">
                    {clinicContent.testimonials.map((item) => (
                        <li key={item.name} className="rounded-[14px] border border-line bg-surface p-[26px]">
                            <p className="text-base leading-[1.6] text-ink-3">“{item.text}”</p>
                            <p className="mt-4 text-[15px] font-extrabold">{item.name}</p>
                        </li>
                    ))}
                </ul>
            </PublicSection>
        </>
    );
}
