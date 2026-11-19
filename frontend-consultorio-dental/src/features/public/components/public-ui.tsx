import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/shared/brand-logo.component";
import { cn } from "@/lib/utils";
import { publicStyles } from "@/features/public/public-styles";

/** Sección del sitio (maqueta Sitio Web): padding 88x64, alterna fondo blanco / #f4f5f7. */
export function PublicSection({
    id,
    className,
    children,
    muted,
}: {
    id?: string;
    className?: string;
    children: ReactNode;
    /** Fondo #f4f5f7 en lugar de blanco. */
    muted?: boolean;
}) {
    return (
        <section id={id} className={cn("scroll-mt-4", muted && "bg-background", className)}>
            <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:px-16 lg:py-[88px]">{children}</div>
        </section>
    );
}

/** Rótulo rosa de sección: 15/700 #e0566c. */
export function SectionEyebrow({ children }: { children: ReactNode }) {
    return <div className="text-[15px] font-bold text-brand">{children}</div>;
}

/** Título de sección: 38/800, tracking -0.02em. */
export function SectionTitle({
    children,
    className,
    as: Heading = "h2",
}: {
    children: ReactNode;
    className?: string;
    as?: "h1" | "h2";
}) {
    return (
        <Heading className={cn("mt-3 text-[28px] leading-[1.15] font-extrabold tracking-[-0.02em] sm:text-[38px]", className)}>
            {children}
        </Heading>
    );
}

/** Encabezado centrado (rótulo + título + descripción opcional). */
export function SectionIntro({
    eyebrow,
    title,
    description,
    className,
    as,
}: {
    eyebrow: string;
    title: string;
    description?: string;
    className?: string;
    as?: "h1" | "h2";
}) {
    return (
        <div className={cn("mx-auto max-w-[760px] text-center", className)}>
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <SectionTitle as={as}>{title}</SectionTitle>
            {description && <p className="mt-4 text-[17px] leading-[1.65] text-ink-3">{description}</p>}
        </div>
    );
}

/** Botón primario del sitio (rosa, halo en hover). */
export function PrimaryLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
    return (
        <Link
            to={to}
            className={cn(
                "flex h-[52px] items-center rounded-[10px] px-7 text-base font-bold",
                publicStyles.primaryButton,
                "hover:shadow-none",
                className,
            )}
        >
            {children}
        </Link>
    );
}

/** Botón gris suave del sitio. */
export function SoftLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
    return (
        <Link
            to={to}
            className={cn("flex h-[52px] items-center rounded-[10px] px-7 text-base font-bold", publicStyles.outlineButton, className)}
        >
            {children}
        </Link>
    );
}

/** Imagen de la maqueta (image-slot): foto por URL o bloque neutro si no hay. */
export function PhotoBlock({ src, alt, className, eager }: { src?: string; alt: string; className?: string; eager?: boolean }) {
    return (
        <div className={cn("overflow-hidden rounded-2xl bg-fill", className)}>
            {src ? (
                <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} className="size-full object-cover" />
            ) : (
                <div className="flex size-full items-center justify-center" aria-hidden="true">
                    <BrandMark className="size-16 rounded-2xl" iconClassName="size-8" />
                </div>
            )}
        </div>
    );
}

/** Esqueleto de tarjeta (servicio / oferta). */
export function CardSkeleton() {
    return (
        <div aria-hidden="true" className="overflow-hidden rounded-[14px] border border-line bg-surface">
            <div className="h-[230px] animate-pulse bg-fill" />
            <div className="space-y-3 px-[26px] py-6">
                <div className="h-6 w-2/3 animate-pulse rounded bg-fill" />
                <div className="h-4 w-full animate-pulse rounded bg-fill" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-fill" />
            </div>
        </div>
    );
}
