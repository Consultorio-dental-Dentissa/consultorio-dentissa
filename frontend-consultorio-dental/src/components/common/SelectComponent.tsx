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
}

export function SelectComponent({ title, placeholder, data, onChange, value }: SelectProps) {
    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className="w-full p-5 rounded-md">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="p-4">
                <SelectGroup>
                    <SelectLabel>{title}</SelectLabel>
                    {data.map((dato) => <SelectItem value={dato.value}>{dato.data}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}