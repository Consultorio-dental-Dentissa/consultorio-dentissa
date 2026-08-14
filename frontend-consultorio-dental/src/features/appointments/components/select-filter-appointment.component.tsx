import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";


interface SelectFilterProps {
    value: string | null;
    onChange: (value: string) => void
}

export function SelectFilterAppointment({ value, onChange }: SelectFilterProps)  {

    const SelectStatusData = [
        { data: 'Todos', value: 'TODOS' },
        { data: 'Pendiente', value: 'PENDIENTE' },
        { data: 'Confirmada', value: 'CONFIRMADA' },
        { data: 'Completada', value: 'COMPLETADA' },
        { data: 'Reprogramada', value: 'REPROGRAMADA' },
        { data: 'Cancelada', value: 'CANCELADA' }
    ];

    return (
        <Select value={value ? value : 'TODOS'} onValueChange={onChange} defaultValue={SelectStatusData[0].value}>
            <SelectTrigger className='flex rounded-md py-4'>
                Estado: <SelectValue />
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