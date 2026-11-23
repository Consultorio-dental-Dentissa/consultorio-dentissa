import { useId, type ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectComponent, type SelectData } from "@/components/shared/select.component";
import { FieldError } from "@/components/shared/input.component";
import { FormRow } from "@/components/shared/form-row.component";

interface FormRowInputProps {
    label: string;
    icon?: LucideIcon;
    registration?: UseFormRegisterReturn;
    type?: string;
    autoComplete?: string;
    inputMode?: "text" | "numeric" | "tel" | "email" | "decimal";
    max?: string;
    min?: string;
    step?: string;
    placeholder?: string;
    error?: string;
    hint?: ReactNode;
    /** Campo de solo lectura (fondo #f5f6f7): se muestra el valor sin permitir edición. */
    readOnlyValue?: string;
    /** Pinta el asterisco y marca el control con `aria-required`. */
    required?: boolean;
    /** Etiqueta encima del control en lugar de a su izquierda. */
    stacked?: boolean;
}

/** Campo en fila de formulario de docs/DISEÑO-FINAL (Modificar datos): etiqueta con icono a la izquierda, control a la derecha. */
export function FormRowInput({
    label, icon, registration, type = "text", autoComplete, inputMode, max, min, step, placeholder, error, hint, readOnlyValue, required, stacked,
}: FormRowInputProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
        <FormRow label={label} icon={icon} htmlFor={readOnlyValue !== undefined ? undefined : id} required={required} stacked={stacked}>
            <div className="flex flex-col gap-1.5">
                {readOnlyValue !== undefined ? (
                    <Input value={readOnlyValue} readOnly disabled aria-label={label} aria-describedby={hint ? hintId : undefined} />
                ) : (
                    <Input
                        id={id}
                        type={type}
                        autoComplete={autoComplete}
                        inputMode={inputMode}
                        max={max}
                        min={min}
                        step={step}
                        placeholder={placeholder}
                        aria-invalid={error ? true : undefined}
                        aria-required={required || undefined}
                        aria-describedby={error ? errorId : hint ? hintId : undefined}
                        {...registration}
                    />
                )}
                {hint && !error && <p id={hintId} className="text-[13.5px] text-ink-4">{hint}</p>}
                <FieldError id={errorId} message={error} />
            </div>
        </FormRow>
    );
}

interface FormRowTextareaProps {
    label: string;
    icon?: LucideIcon;
    registration?: UseFormRegisterReturn;
    rows?: number;
    maxLength?: number;
    placeholder?: string;
    error?: string;
    hint?: ReactNode;
    required?: boolean;
    /** Etiqueta encima del control en lugar de a su izquierda. */
    stacked?: boolean;
}

/** Área de texto en fila de formulario (etiqueta arriba a la izquierda, como en docs/DISEÑO-FINAL). */
export function FormRowTextarea({ label, icon, registration, rows, maxLength, placeholder, error, hint, required, stacked }: FormRowTextareaProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
        <FormRow label={label} icon={icon} htmlFor={id} align="top" required={required} stacked={stacked}>
            <div className="flex flex-col gap-1.5">
                <Textarea
                    id={id}
                    rows={rows}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    aria-required={required || undefined}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : hint ? hintId : undefined}
                    {...registration}
                />
                {hint && !error && <p id={hintId} className="text-[13.5px] text-ink-4">{hint}</p>}
                <FieldError id={errorId} message={error} />
            </div>
        </FormRow>
    );
}

interface FormRowSelectProps {
    label: string;
    icon?: LucideIcon;
    data: SelectData[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    hint?: ReactNode;
    required?: boolean;
    /** Etiqueta encima del control en lugar de a su izquierda. */
    stacked?: boolean;
}

/** Selector en fila de formulario. */
export function FormRowSelect({ label, icon, data, value, onChange, placeholder, error, hint, required, stacked }: FormRowSelectProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
        <FormRow label={label} icon={icon} htmlFor={id} required={required} stacked={stacked}>
            <div className="flex flex-col gap-1.5">
                <SelectComponent
                    id={id}
                    data={data}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    invalid={!!error}
                    required={required}
                    aria-describedby={error ? errorId : hint ? hintId : undefined}
                />
                {hint && !error && <p id={hintId} className="text-[13.5px] text-ink-4">{hint}</p>}
                <FieldError id={errorId} message={error} />
            </div>
        </FormRow>
    );
}
