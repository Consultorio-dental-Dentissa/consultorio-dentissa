import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ErrorSpan } from "./span.component";
import { Field } from "@/components/ui/field"
import { SelectComponent, type SelectData } from "./select.component";
import { Search } from "lucide-react"
import { Textarea } from "@/components/ui/textarea";
import type { UseFormRegisterReturn } from "react-hook-form"
import { useState } from "react";

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

export function TextareaForm({ placeholder, error, registration, label }: InputFormProps) {

    const [charLenght, setCharLenght] = useState(0);

    return (
        <Field>
            <Label>{label}</Label>
            <div className='relative'>
                <div className='text-muted-foreground pointer-events-none absolute bottom-3 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50'>
                    {charLenght}
                </div>
                <Textarea
                    placeholder={placeholder}
                    {...registration}
                    className={`p-5 pb-10 rounded-md ${error && 'border-2 border-red-400'}`}
                    onChange={(e) => {

                        /**
                         * INDICACIÓN:
                         * el campo registration tiene su propio onChange,
                         * sin embargo al usar un onChange a parte el anterior
                         * se sobreescribe y solo se ejecuta el onChange que 
                         * definimos explicitamente. Con esta solucion, nos
                         * aseguramos de que ambos onChange se ejecuten sin que
                         * uno reemplace al otro
                         */
                        registration?.onChange(e);
                        setCharLenght(e.target.value.length);
                    }}
                />
            </div>
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

interface SearchInputProps {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    placeholder?: string;
}
export function SearchInput({ onChange, value, placeholder }: SearchInputProps) {
    return (
        <div className="relative">
            <Input
                onChange={onChange}
                placeholder={placeholder}
                value={value}
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
                styles={`p-5 ${error && 'border-2 border-red-400'}`}
            />
            {error && <ErrorSpan message={error} />}
        </Field>
    )
}