import { EmptyState } from "@/components/shared/empty-state.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { usePublicOffers } from "@/features/public/hooks/use-public-content";
import { CardSkeleton, PhotoBlock, PrimaryLink, PublicSection, SectionIntro } from "@/features/public/components/public-ui";
import { useBookingPath } from "@/features/public/hooks/use-booking-path";
import { formatDate } from "@/utils/formatters";

/** Ofertas activas y vigentes (GET /offers, público), con las mismas tarjetas que los servicios. */
export default function PublicOffersPage() {
    const { data, isLoading, isError, error, refetch } = usePublicOffers();
    const bookTo = useBookingPath();
    const offers = data?.items ?? [];

    return (
        <PublicSection>
            <SectionIntro
                as="h1"
                eyebrow="Ofertas"
                title="Promociones vigentes"
                description="Aprovecha nuestras promociones mientras estén disponibles."
            />

            <div className="mt-11">
                {isLoading ? (
                    <div role="status" aria-label="Cargando ofertas" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }, (_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : isError ? (
                    <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => void refetch()} />
                ) : offers.length === 0 ? (
                    <EmptyState
                        title="No hay ofertas vigentes por ahora"
                        description="Vuelve pronto: publicamos nuevas promociones con frecuencia."
                    />
                ) : (
                    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {offers.map((offer) => (
                            <li key={offer.id}>
                                <article className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-surface">
                                    <PhotoBlock
                                        src={offer.imageUrl ?? undefined}
                                        alt={`Imagen de la oferta ${offer.name}`}
                                        className="h-[230px] shrink-0 rounded-none bg-background"
                                    />
                                    <div className="flex flex-1 flex-col px-[26px] pt-6 pb-[26px]">
                                        <h2 className="text-[21px] font-extrabold">{offer.name}</h2>
                                        <p className="mt-2 text-base leading-[1.55] text-ink-3">{offer.description}</p>
                                        {offer.services.length > 0 && (
                                            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Servicios incluidos">
                                                {offer.services.map((service) => (
                                                    <li
                                                        key={service.id}
                                                        className="rounded-full bg-brand-soft px-3 py-1 text-[13.5px] font-bold text-brand"
                                                    >
                                                        {service.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <p className="mt-auto pt-5 text-[15px] font-semibold text-ink-4">
                                            Vigente hasta el {formatDate(offer.endDate)}
                                        </p>
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-12 flex justify-center">
                <PrimaryLink to={bookTo}>Agenda tu cita</PrimaryLink>
            </div>
        </PublicSection>
    );
}
