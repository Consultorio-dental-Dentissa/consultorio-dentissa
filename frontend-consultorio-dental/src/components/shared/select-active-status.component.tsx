import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";

interface SelectActiveStatusProps {
    value: string | null;
    onChange: (value: string) => void;
}

const SelectStatusData = [
    { data: 'Todos', value: 'TODOS' },
    { data: 'Activo', value: 'ACTIVO' },
    { data: 'No activo', value: 'INACTIVO' },
];

export function SelectActiveStatus({ value, onChange }: SelectActiveStatusProps) {
    return (
        <Select value={value ? value : 'TODOS'} onValueChange={onChange}>
            <SelectTrigger className='flex rounded-md py-4'>
                Estado: <SelectValue className="font-bold" />
            </SelectTrigger>
            <SelectContent position='popper' className='w-full'>
                {SelectStatusData.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                        {item.data}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
