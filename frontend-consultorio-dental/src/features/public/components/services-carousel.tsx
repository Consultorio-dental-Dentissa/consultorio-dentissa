import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Service } from "@/features/services/types/service.model";
import { ServiceCard } from "@/features/public/components/service-card";
import { SectionEyebrow, SectionTitle } from "@/features/public/components/public-ui";
import { cn } from "@/lib/utils";

const CARD_WIDTH = 420;
const GAP = 24;

/** Carrusel de servicios de la maqueta: tarjetas de 420px, gap 24, flechas 50px y puntos (activo 28px). */
export function ServicesCarousel({ services }: { services: Service[] }) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [viewportWidth, setViewportWidth] = useState(0);
    const [slide, setSlide] = useState(0);

    useEffect(() => {
        const node = viewportRef.current;
        if (!node) return;
        const observer = new ResizeObserver(() => setViewportWidth(node.clientWidth));
        observer.observe(node);
        setViewportWidth(node.clientWidth);
        return () => observer.disconnect();
    }, []);

    const cardWidth = viewportWidth > 0 ? Math.min(CARD_WIDTH, viewportWidth) : CARD_WIDTH;
    const step = cardWidth + GAP;
    const perView = Math.max(1, Math.floor((viewportWidth + GAP) / step));
    const maxSlide = Math.max(0, services.length - perView);
    const current = Math.min(slide, maxSlide);

    return (
        <div>
            <div className="flex items-end justify-between gap-5">
                <div>
                    <SectionEyebrow>Servicios</SectionEyebrow>
                    <SectionTitle>Nuestros tratamientos</SectionTitle>
                </div>
                <div className="flex gap-2.5">
                    <button
                        type="button"
                        aria-label="Servicios anteriores"
                        disabled={current === 0}
                        onClick={() => setSlide(Math.max(0, current - 1))}
                        className="flex size-[50px] items-center justify-center rounded-[10px] bg-fill text-foreground transition-colors outline-none hover:bg-[#e6e8eb] focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft className="size-5" strokeWidth={2.3} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        aria-label="Servicios siguientes"
                        disabled={current >= maxSlide}
                        onClick={() => setSlide(Math.min(maxSlide, current + 1))}
                        className="flex size-[50px] items-center justify-center rounded-[10px] bg-primary text-white transition-colors outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronRight className="size-5" strokeWidth={2.3} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div ref={viewportRef} className="mt-10 overflow-hidden">
                <ul
                    className="flex transition-transform duration-[450ms] ease-in-out motion-reduce:transition-none"
                    style={{ gap: GAP, transform: `translateX(-${current * step}px)` }}
                >
                    {services.map((service) => (
                        <li key={service.id} className="flex-none" style={{ width: cardWidth }}>
                            <ServiceCard service={service} />
                        </li>
                    ))}
                </ul>
            </div>

            {maxSlide > 0 && (
                <div className="mt-[30px] flex justify-center gap-2" role="group" aria-label="Páginas del carrusel">
                    {Array.from({ length: maxSlide + 1 }, (_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Ir a la posición ${i + 1}`}
                            aria-current={i === current}
                            onClick={() => setSlide(i)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                i === current ? "w-7 bg-primary" : "w-2 bg-input",
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
