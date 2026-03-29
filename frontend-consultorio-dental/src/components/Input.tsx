import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ErrorSpan } from "./Span";
import { Field } from "@/components/ui/field"
import { SelectComponent, type SelectData } from "./SelectComponent";
import type { UseFormRegisterReturn } from "react-hook-form"

interface InputFormProps {
    label: string;
    placeholder?: string;
    error?: string;
    type?: string;
    registration?: UseFormRegisterReturn;
}

export function InputForm({ label, placeholder, error, type, registration }: InputFormProps) {
    return (
        <Field>
            <Label>{label}</Label>
            <Input 
                placeholder={placeholder} 
                {...registration} 
                type={type}
                className={`p-5 rounded-md ${error && 'border-red-600'}`}>
            </Input>
            {error && <ErrorSpan message={error} />}
        </Field>
    )
}

interface SelectFormProps {
    label: string
    title: string
    placeholder: string;
    DATA: SelectData[];
    onChange: () => void
    value: string
    error?: string
}

export function SelectForm({label, title, placeholder, DATA, onChange, value, error}: SelectFormProps) {
    return (
        <Field>
            <Label>{label}</Label>
            <SelectComponent
                title={title}
                placeholder={placeholder}
                data={DATA}
                onChange={onChange}
                value={value}
            />
            {error && <ErrorSpan message={error} />}
        </Field>
    )
}