import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/shared/empty-state.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { clinicContent } from "@/config/clinic-content";
import { getHomeRoute } from "@/config/navigation";
import { useActiveServices } from "@/features/services/hooks/use-services";
import { usePublicFaqs, usePublicStats } from "@/features/public/hooks/use-public-content";
import { FaqAccordion, FaqSkeleton } from "@/features/public/components/faq-accordion";
import { ServicesCarousel } from "@/features/public/components/services-carousel";
import {
    CardSkeleton,
    PhotoBlock,
    PrimaryLink,
    PublicSection,
    SectionEyebrow,
    SectionTitle,
    SoftLink,
} from "@/features/public/components/public-ui";
import { useBookingPath } from "@/features/public/hooks/use-booking-path";

// ---------------------------------------------------------------- HERO

/** Hero de la maqueta: texto a la izquierda (rótulo, h1 54/800, párrafo, 2 botones) y foto 460px a la derecha. */
export function HeroSection() {
    const bookTo = useBookingPath();

    return (
        <section id="inicio">
            <div className="mx-auto grid w-full max-w-[1440px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-16 lg:py-20">
                <div>
                    <div className="text-[15px] font-bold text-brand">Consultorio dental</div>
                    <h1 className="mt-3.5 text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[46px] lg:text-[54px]">
                        Cuidamos tu sonrisa con atención cercana
                    </h1>
                    <p className="mt-[22px] max-w-[500px] text-lg leading-[1.65] text-ink-3">
                        Tratamientos para toda la familia, con un equipo que te explica cada paso. Crea tu cuenta y agenda tu cita en línea.
                    </p>
                    <div className="mt-[34px] flex flex-wrap gap-3.5">
                        <PrimaryLink to={bookTo}>Agendar mi cita</PrimaryLink>
                        <SoftLink to="/nuestros-servicios">Ver servicios</SoftLink>
                    </div>
                </div>
                <PhotoBlock src={clinicContent.heroImageUrl} alt="Consultorio Dentissa" eager className="h-[280px] bg-background sm:h-[380px] lg:h-[460px]" />
            </div>
        </section>
    );
}

// ---------------------------------------------------------------- SOBRE NOSOTROS

export function AboutSection({ heading = "h2" }: { heading?: "h1" | "h2" }) {
    const stats = usePublicStats();

    // Pacientes y tratamientos salen de la base de datos; mientras cargan (o si falla) se muestra "—", nunca una cifra inventada.
    const format = (value: number | undefined) => (value === undefined ? "—" : value.toLocaleString("es-MX"));
    const facts = clinicContent.facts.map((fact) => {
        if (fact.key === "patients") return { ...fact, value: format(stats.data?.patients) };
        if (fact.key === "treatments") return { ...fact, value: format(stats.data?.treatments) };
        return fact;
    });

    return (
        <PublicSection id="nosotros" muted>
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                <div className="h-[280px] overflow-hidden rounded-2xl bg-[#e9ebee] sm:h-[340px] lg:h-[400px]">
                    <iframe
                        src={clinicContent.mapEmbedUrl}
                        title="Mapa con la ubicación del consultorio"
                        className="size-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                </div>
                <div>
                    <SectionEyebrow>Sobre nosotros</SectionEyebrow>
                    <SectionTitle as={heading}>Más de 15 años cuidando la salud dental de nuestros pacientes</SectionTitle>
                    <p className="mt-5 text-[17px] leading-[1.7] text-ink-3">
                        En Dentissa ofrecemos odontología general, estética y especializada. Trabajamos con equipo moderno y nos tomamos el tiempo de explicarte tu diagnóstico y tus opciones, sin presiones.
                    </p>
                    <dl className="mt-[34px] grid grid-cols-3 gap-5">
                        {facts.map((fact) => (
                            <div key={fact.label} className="flex flex-col-reverse">
                                <dt className="mt-0.5 text-[15px] font-semibold text-ink-3">{fact.label}</dt>
                                <dd className="text-[28px] font-extrabold text-primary sm:text-[34px]">{fact.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </PublicSection>
    );
}

// ---------------------------------------------------------------- SERVICIOS

export function ServicesSection() {
    const { data: services, isLoading, isError, error, refetch } = useActiveServices();
    const hasServices = !isLoading && !isError && !!services && services.length > 0;

    let body: ReactNode;
    if (isLoading)
        body = (
            <div role="status" aria-label="Cargando servicios" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    else if (isError) body = <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => void refetch()} />;
    else if (!services || services.length === 0)
        body = <EmptyState title="Aún no hay servicios publicados" description="Pronto compartiremos nuestro catálogo." />;
    else body = <ServicesCarousel services={services} />;

    return (
        <PublicSection id="servicios">
            {hasServices ? (
                body
            ) : (
                <>
                    <SectionEyebrow>Servicios</SectionEyebrow>
                    <SectionTitle>Nuestros tratamientos</SectionTitle>
                    <div className="mt-10">{body}</div>
                </>
            )}
        </PublicSection>
    );
}

// ---------------------------------------------------------------- FAQ

export function FaqSection({ limit, heading = "h2" }: { limit?: number; heading?: "h1" | "h2" }) {
    const { data, isLoading, isError, error, refetch } = usePublicFaqs();
    const items = limit ? data?.items.slice(0, limit) : data?.items;

    let body: ReactNode;
    if (isLoading) body = <div role="status" aria-label="Cargando preguntas"><FaqSkeleton /></div>;
    else if (isError) body = <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => void refetch()} />;
    else if (!items || items.length === 0)
        body = <EmptyState title="Aún no hay preguntas publicadas" description="Si tienes dudas, escríbenos y con gusto te atendemos." />;
    else body = <FaqAccordion items={items} />;

    return (
        <PublicSection id="faq" muted>
            <div className="mx-auto max-w-[860px]">
                <div className="text-center">
                    <SectionEyebrow>Preguntas frecuentes</SectionEyebrow>
                    <SectionTitle as={heading}>Resolvemos tus dudas</SectionTitle>
                </div>
                <div className="mt-11">{body}</div>
            </div>
        </PublicSection>
    );
}

// ---------------------------------------------------------------- CONTACTO

const CONTACT_ROWS: { label: string; value: string; href?: string }[] = [
    { label: "Dirección", value: clinicContent.address },
    { label: "Teléfono", value: clinicContent.phone, href: `tel:${clinicContent.phone.replace(/\s/g, "")}` },
    { label: "Correo", value: clinicContent.email, href: `mailto:${clinicContent.email}` },
    { label: "Horario", value: clinicContent.schedule },
];

const WHITE_BUTTON =
    "flex h-[50px] items-center rounded-[10px] bg-white px-[26px] text-base font-extrabold text-brand transition-colors hover:bg-[#fff4f6] hover:text-brand";

export function ContactSection({ heading = "h2" }: { heading?: "h1" | "h2" }) {
    const { user } = useAuth();

    return (
        <PublicSection id="contacto">
            <div className="grid items-stretch gap-10 lg:grid-cols-2">
                <div>
                    <SectionEyebrow>Contáctanos</SectionEyebrow>
                    <SectionTitle as={heading}>Estamos para atenderte</SectionTitle>
                    <dl className="mt-[30px] flex flex-col border-t border-line-soft">
                        {CONTACT_ROWS.map((row) => (
                            <div key={row.label} className="flex flex-col gap-1 border-b border-line-soft py-5 sm:flex-row sm:gap-0">
                                <dt className="text-base font-semibold text-ink-4 sm:w-[150px] sm:shrink-0">{row.label}</dt>
                                <dd className="text-[17px] font-bold">
                                    {row.href ? (
                                        <a href={row.href} className="text-foreground hover:text-brand">
                                            {row.value}
                                        </a>
                                    ) : (
                                        row.value
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    {clinicContent.mapUrl && (
                        <a
                            href={clinicContent.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-block text-[15px] font-bold text-brand hover:text-brand-hover"
                        >
                            Ver en el mapa
                        </a>
                    )}
                </div>

                <div className="flex flex-col justify-center rounded-2xl bg-primary p-7 sm:p-12">
                    <h3 className="text-[26px] leading-[1.2] font-extrabold text-white sm:text-[32px]">
                        Crea tu cuenta y agenda tu primera cita
                    </h3>
                    <p className="mt-4 max-w-[440px] text-[17px] leading-[1.65] text-white">
                        Regístrate en menos de un minuto. Desde tu cuenta podrás agendar, ver tus citas y consultar tu historial.
                    </p>
                    <ol className="mt-[26px] flex flex-col gap-3">
                        {clinicContent.bookingSteps.map((step, index) => (
                            <li key={step} className="flex items-center gap-3.5 text-[16.5px] font-bold text-white">
                                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-white text-[15px] font-extrabold text-brand">
                                    {index + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ol>
                    <div className="mt-[34px] flex flex-wrap gap-3">
                        {user ? (
                            <Link to={getHomeRoute(user.role)} className={WHITE_BUTTON}>
                                Ir a mi panel
                            </Link>
                        ) : (
                            <>
                                <Link to="/registrate" className={WHITE_BUTTON}>
                                    Crear cuenta
                                </Link>
                                <Link
                                    to="/login"
                                    className="flex h-[50px] items-center rounded-[10px] border-[1.5px] border-white px-[26px] text-base font-bold text-white transition-colors hover:bg-white/15 hover:text-white"
                                >
                                    Ya tengo cuenta
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </PublicSection>
    );
}
