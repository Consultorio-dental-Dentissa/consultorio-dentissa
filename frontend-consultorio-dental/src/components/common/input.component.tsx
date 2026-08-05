import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ErrorSpan } from "./span.component";
import { Field } from "@/components/ui/field"
import { SelectComponent, type SelectData } from "./select.component";
import { Search } from "lucide-react"
import type { UseFormRegisterReturn } from "react-hook-form"

interface InputFormProps {
    label?: string;
    placeholder?: string;
    error?: string;
    type?: string;
    step?: string;
    registration?: UseFormRegisterReturn;
}

export function InputForm({ label, placeholder, error, type, step, registration }: InputFormProps) {
    return (
        <Field>
            <Label>{label}</Label>
            <Input
                placeholder={placeholder}
                {...registration}
                type={type}
                step={step}
                className={`p-5 rounded-md ${error && 'border-2 border-red-400'}`}>
            </Input>
            {error && <ErrorSpan message={error} />}
        </Field>
    )
}


/**
 * TODO:
 * Add an onChange property to pass to SearchInput a function
 * that searches in the api for data that is written to the input
 * 
 * Remember to use useDebounce to make the function run after
 * the user finishes typing in the input
 */
export function SearchInput({ placeholder }: InputFormProps) {
    return (
        <div className="relative">
            <Input
                placeholder={placeholder}
                className="pl-10 py-4 rounded-md focus-visible:ring-rose-200 focus-visible:border-rose-300"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
    )
}


interface SelectFormProps {
    label: string
    title: string
    placeholder: string;
    DATA: SelectData[];
    onChange: () => void
    value: any
    error?: string
}

export function SelectForm({ label, title, placeholder, DATA, onChange, value, error }: SelectFormProps) {
    return (
        <Field>
            <Label>{label}</Label>
            <SelectComponent
                title={title}
                placeholder={placeholder}
                data={DATA}
                onChange={onChange}
                value={value}
                styles={error && 'border-2 border-red-400'}
            />
            {error && <ErrorSpan message={error} />}
        </Field>
    )
}