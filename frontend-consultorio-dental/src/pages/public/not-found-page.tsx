import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-foreground">
                <Compass className="size-8" aria-hidden="true" />
            </span>
            <div>
                <h1 className="text-2xl font-bold">Página no encontrada</h1>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    La dirección que buscas no existe o fue movida.
                </p>
            </div>
            <Button asChild>
                <Link to="/">Ir al inicio</Link>
            </Button>
        </div>
    );
}
