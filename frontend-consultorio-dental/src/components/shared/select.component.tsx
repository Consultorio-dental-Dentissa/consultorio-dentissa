import {
    Select, SelectContent,
    SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export interface SelectData {
    data: any;
    value: any;
}

interface SelectProps {
    title?: string;
    placeholder?: string;
    onChange?: (e: any) => void;
    data: SelectData[],
    value?: string;
    styles?: string;
}

export function SelectComponent({ placeholder, data, onChange, value, styles }: SelectProps) {
    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className={`rounded-md ${styles}`}>
                <SelectValue className="placeholder:text-black" placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper">
                    {data.map((dato) => <SelectItem value={String(dato.value)}>{String(dato.data)}</SelectItem>)}
            </SelectContent>
        </Select>
    )
}