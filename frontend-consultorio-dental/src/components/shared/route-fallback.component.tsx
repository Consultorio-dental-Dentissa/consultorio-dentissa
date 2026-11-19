import { Skeleton } from "@/components/ui/skeleton";

/** Fallback de `Suspense` mientras se descarga el código de una pantalla (carga por rutas). */
export function RouteFallback() {
    return (
        <div role="status" aria-busy="true" className="flex w-full flex-col gap-5 py-2">
            <span className="sr-only">Cargando pantalla...</span>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
            <Skeleton className="h-72 w-full rounded-xl" />
        </div>
    );
}
