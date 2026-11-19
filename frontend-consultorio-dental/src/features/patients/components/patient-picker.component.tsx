import { useId, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { FieldError } from "@/components/shared/input.component";
import { usePatients } from "@/features/patients/hooks/use-patients";
import { useDebounce } from "@/hooks/use-debounce";

export interface PickedPatient {
    id: number;
    name: string;
    lastname: string;
}

interface PatientPickerProps {
    value: PickedPatient | null;
    onChange: (patient: PickedPatient | null) => void;
    error?: string;
}

/**
 * Selector de paciente con búsqueda en servidor (no descarga todos los
 * pacientes): solo pide los primeros resultados que coinciden con el texto.
 */
export function PatientPicker({ value, onChange, error }: PatientPickerProps) {
    const id = useId();
    const [search, setSearch] = useState("");
    const debounced = useDebounce(search, 300);

    const query = usePatients({ search: debounced, limit: 6, status: "ACTIVO" });

    if (value) {
        return (
            <div className="flex flex-col gap-1.5">
                <Label>Paciente</Label>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-input bg-surface px-3 py-2">
                    <span className="text-[15px] font-semibold">{value.name} {value.lastname}</span>
                    <Button
                        type="button" variant="ghost" size="icon-sm"
                        onClick={() => onChange(null)}
                        aria-label="Cambiar paciente"
                    >
                        <X />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>Paciente<span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
                id={id}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca por nombre, correo o teléfono"
                aria-invalid={error ? true : undefined}
                aria-describedby={`${id}-results`}
                autoComplete="off"
            />

            <div id={`${id}-results`} className="rounded-lg border border-border/70 bg-surface-muted/50">
                {query.isPending && (
                    <p className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                        <Spinner /> Buscando pacientes...
                    </p>
                )}
                {query.isError && (
                    <p role="alert" className="px-3 py-3 text-sm text-destructive">{query.error.message}</p>
                )}
                {query.data && query.data.items.length === 0 && (
                    <p className="px-3 py-3 text-sm text-muted-foreground">No encontramos pacientes activos con ese dato.</p>
                )}
                {query.data && query.data.items.length > 0 && (
                    <ul className="max-h-48 overflow-y-auto py-1">
                        {query.data.items.map((patient) => (
                            <li key={patient.id}>
                                <button
                                    type="button"
                                    onClick={() => onChange({ id: patient.id, name: patient.name, lastname: patient.lastname })}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left outline-none hover:bg-brand-soft focus-visible:bg-brand-soft"
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate text-[15px] font-semibold">{patient.name} {patient.lastname}</span>
                                        <span className="block truncate text-sm text-ink-4">{patient.email}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <FieldError id={`${id}-error`} message={error} />
        </div>
    );
}
