import {
    Select, SelectContent, SelectGroup,
    SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export interface SelectData {
    data: any;
    value: any;
}

interface SelectProps {
    title: string;
    placeholder?: string;
    onChange: (e: any) => void;
    data: SelectData[],
    value?: string;
    styles?: string;
}

export function SelectComponent({ title, placeholder, data, onChange, value, styles }: SelectProps) {
    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className={`w-full p-5 rounded-md ${styles}`}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className='px-5 py-1 flex justify-center'>
                <SelectGroup>
                    <SelectLabel>{title}</SelectLabel>
                    {data.map((dato) => <SelectItem value={String(dato.value)}>{String(dato.data)}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}