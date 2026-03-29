import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"

export interface SelectData {
    data: any;
    value: any;
}

interface SelectProps {
    title: string;
    placeholder?: string;
    onChange: (e: any) => void;
    data: SelectData[]
}

export function SelectComponent({ title, placeholder, data, onChange }: SelectProps) {
    return (
        <Select onValueChange={(e) => onChange(e)}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{title}</SelectLabel>
                    {data.map((dato) => <SelectItem value={dato.value}>{dato.data}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}