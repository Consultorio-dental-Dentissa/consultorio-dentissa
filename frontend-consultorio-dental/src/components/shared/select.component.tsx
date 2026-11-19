import {
    Select, SelectContent,
    SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectData {
    data: string | number;
    value: string | number;
}

interface SelectProps {
    id?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    data: SelectData[];
    value?: string;
    className?: string;
    invalid?: boolean;
    disabled?: boolean;
    required?: boolean;
    "aria-label"?: string;
    "aria-describedby"?: string;
}

/** Select compartido (Radix). Los valores se manejan siempre como texto. */
export function SelectComponent({
    id, placeholder, data, onChange, value, className, invalid, disabled, required,
    "aria-label": ariaLabel, "aria-describedby": describedBy,
}: SelectProps) {
    return (
        <Select onValueChange={onChange} value={value} disabled={disabled}>
            <SelectTrigger
                id={id}
                className={cn("w-full", className)}
                aria-invalid={invalid || undefined}
                aria-required={required || undefined}
                aria-label={ariaLabel}
                aria-describedby={describedBy}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper">
                {data.map((item) => (
                    <SelectItem key={String(item.value)} value={String(item.value)}>
                        {String(item.data)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

interface FilterSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectData[];
}

/** Select de barras de filtros de docs/DISEÑO-FINAL (44px, radio 8, mín. 170px); antepone la etiqueta: "Estatus: Todos". */
export function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger
                aria-label={`Filtrar por ${label.toLowerCase()}`}
                className="h-11 w-full gap-1.5 rounded-lg px-3 sm:w-auto sm:min-w-[170px]"
            >
                <span className="text-[13.5px] font-semibold text-ink-4" aria-hidden="true">{label}:</span>
                <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
                {options.map((item) => (
                    <SelectItem key={String(item.value)} value={String(item.value)}>
                        {String(item.data)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
