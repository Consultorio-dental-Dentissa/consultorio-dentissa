import { useId, useState, type ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectComponent, type SelectData } from "@/components/shared/select.component";

/** Mensaje de error de campo, enlazado con aria-describedby. */
export function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return (
        <p id={id} role="alert" className="text-[13.5px] font-semibold text-destructive">
            {message}
        </p>
    );
}

interface BaseFieldProps {
    label: string;
    /** `auth` = estilo de las pantallas de acceso (campos de 48px, etiqueta #4a4a52). */
    variant?: "default" | "auth";
    /** Elemento a la derecha de la etiqueta (p. ej. "¿Olvidaste tu contraseña?"). */
    labelAction?: ReactNode;
    error?: string;
    hint?: string;
    required?: boolean;
}

function FieldShell({
    label, error, hint, required, htmlFor, errorId, hintId, children, variant, labelAction,
}: BaseFieldProps & { htmlFor: string; errorId: string; hintId: string; children: ReactNode }) {
    return (
        <div className={cn("flex flex-col", variant === "auth" ? "gap-2" : "gap-[7px]")}>
            <div className="flex items-center justify-between">
                <Label htmlFor={htmlFor} className={variant === "auth" ? "text-[15px]" : undefined}>
                    {label}
                    {required && <span aria-hidden="true" className="text-destructive">*</span>}
                </Label>
                {labelAction}
            </div>
            {children}
            {hint && !error && <p id={hintId} className="text-[13.5px] text-ink-4">{hint}</p>}
            <FieldError id={errorId} message={error} />
        </div>
    );
}

interface InputFormProps extends BaseFieldProps {
    placeholder?: string;
    type?: string;
    step?: string;
    min?: string;
    max?: string;
    autoComplete?: string;
    inputMode?: "text" | "numeric" | "tel" | "email" | "decimal";
    registration?: UseFormRegisterReturn;
    disabled?: boolean;
    /** Se conserva por compatibilidad: los campos de docs/DISEÑO-FINAL no llevan icono. */
    icon?: LucideIcon;
}

export function InputForm({
    label, placeholder, error, hint, required, type = "text", step, min, max, autoComplete, inputMode,
    registration, disabled, variant = "default", labelAction,
}: InputFormProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";

    return (
        <FieldShell {...{ label, error, hint, required, htmlFor: id, errorId, hintId, variant, labelAction }}>
            <div className="relative">
                <Input
                    id={id}
                    placeholder={placeholder}
                    type={isPassword && visible ? "text" : type}
                    step={step}
                    min={min}
                    max={max}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : hint ? hintId : undefined}
                    className={cn(
                        variant === "auth" && "h-[52px] rounded-[10px] px-4 text-base",
                        isPassword && "pr-[84px]",
                    )}
                    {...registration}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="absolute top-1/2 right-4 -translate-y-1/2 rounded text-sm font-bold text-ink-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                        aria-pressed={visible}
                    >
                        {visible ? "Ocultar" : "Mostrar"}
                    </button>
                )}
            </div>
        </FieldShell>
    );
}

interface TextareaFormProps extends BaseFieldProps {
    placeholder?: string;
    maxLength?: number;
    registration?: UseFormRegisterReturn;
    rows?: number;
}

export function TextareaForm({ label, placeholder, error, hint, required, maxLength, registration, rows }: TextareaFormProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
        <FieldShell {...{ label, error, hint, required, htmlFor: id, errorId, hintId }}>
            <Textarea
                id={id}
                rows={rows}
                placeholder={placeholder}
                maxLength={maxLength}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : hint ? hintId : undefined}
                {...registration}
            />
        </FieldShell>
    );
}

interface SelectFormProps extends BaseFieldProps {
    placeholder?: string;
    data: SelectData[];
    onChange: (value: string) => void;
    value?: string;
    disabled?: boolean;
}

export function SelectForm({ label, placeholder, data, onChange, value, error, hint, required, disabled }: SelectFormProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
        <FieldShell {...{ label, error, hint, required, htmlFor: id, errorId, hintId }}>
            <SelectComponent
                id={id}
                placeholder={placeholder}
                data={data}
                onChange={onChange}
                value={value}
                disabled={disabled}
                invalid={!!error}
                aria-describedby={error ? errorId : hint ? hintId : undefined}
            />
        </FieldShell>
    );
}

interface SearchInputProps {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    placeholder?: string;
    label: string;
}

/** Buscador de docs/DISEÑO-FINAL (44px, radio 8, hasta 400px). La búsqueda real ocurre en el servidor. */
export function SearchInput({ onChange, value, placeholder, label }: SearchInputProps) {
    return (
        <div className="relative w-full lg:max-w-[400px] lg:flex-1">
            <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-ink-5"
            />
            <Input
                type="search"
                aria-label={label}
                onChange={onChange}
                placeholder={placeholder}
                value={value}
                className="h-11 rounded-lg pl-10"
            />
        </div>
    );
}
