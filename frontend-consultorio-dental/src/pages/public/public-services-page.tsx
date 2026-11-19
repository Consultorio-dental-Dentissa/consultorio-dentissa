import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state.component";
import { ErrorState } from "@/components/shared/error-state.component";
import { Input } from "@/components/ui/input";
import { useActiveServices } from "@/features/services/hooks/use-services";
import { ServiceCard } from "@/features/public/components/service-card";
import { CardSkeleton, PublicSection, SectionIntro } from "@/features/public/components/public-ui";

/** Servicios activos reales (GET /services) con buscador local sobre el catálogo cargado. */
export default function PublicServicesPage() {
    const { data: services, isLoading, isError, error, refetch } = useActiveServices();
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const term = search.trim().toLocaleLowerCase();
        if (!services) return [];
        return term
            ? services.filter((s) => `${s.name} ${s.description}`.toLocaleLowerCase().includes(term))
            : services;
    }, [services, search]);

    return (
        <PublicSection>
            <SectionIntro
                as="h1"
                eyebrow="Servicios"
                title="Nuestros tratamientos"
                description="Consulta la duración y el precio de cada tratamiento."
            />

            <div className="mx-auto mt-8 max-w-[420px]">
                <Input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Buscar servicio"
                    placeholder="Buscar servicio"
                />
            </div>

            <div className="mt-10">
                {isLoading ? (
                    <div role="status" aria-label="Cargando servicios" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }, (_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : isError ? (
                    <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => void refetch()} />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title={search ? "Sin resultados" : "Aún no hay servicios publicados"}
                        description={search ? "Prueba con otro término de búsqueda." : "Pronto compartiremos nuestro catálogo."}
                    />
                ) : (
                    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((service) => (
                            <li key={service.id}>
                                <ServiceCard service={service} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </PublicSection>
    );
}
