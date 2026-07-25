import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ErrorSpan } from "./span.component";
import { Field } from "@/components/ui/field"
import { SelectInputComponent, type SelectData } from "./select.component";
import type { UseFormRegisterReturn } from "react-hook-form"
import { Textarea } from "../ui/textarea";

interface InputFormProps {
    label: string;
    placeholder?: string;
    error?: string;
    type?: string;
    step?: string;
    isTextarea?: boolean;
    registration?: UseFormRegisterReturn;
}

export function InputForm({ label, placeholder, error, type, step, registration, isTextarea }: InputFormProps) {
    return (
        <Field>
            <Label>{label}</Label>

            {isTextarea ?
            
                <Textarea
                    placeholder={placeholder}
                    {...registration}
                    className={`p-5 rounded-md ${error && 'border-2 border-red-400'} resize-y min-h-[100px]`}>
                </Textarea>

                :
    
                <Input
                    placeholder={placeholder}
                    {...registration}
                    type={type}
                    step={step}
                    className={`p-5 rounded-md ${error && 'border-2 border-red-400'}`}>
                </Input>
            
            }

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
    value: any
    error?: string
}

export function SelectForm({ label, title, placeholder, DATA, onChange, value, error }: SelectFormProps) {
    return (
        <Field>
            <Label>{label}</Label>
            <SelectInputComponent
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