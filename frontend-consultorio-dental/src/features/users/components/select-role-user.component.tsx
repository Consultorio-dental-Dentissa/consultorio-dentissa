import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";


interface SelectFilterProps {
    value: string | null;
    onChange: (value: string) => void
}

export function SelectRoleUser({ value, onChange }: SelectFilterProps)  {

    const SelectStatusData = [
        { data: 'Todos', value: 'TODOS' },
        { data: 'Administrador', value: 'ADMINISTRADOR' },
        { data: 'Asistente', value: 'ASISTENTE' },
        { data: 'Paciente', value: 'PACIENTE' }
    ];

    return (
        <Select value={value ? value : 'TODOS'} onValueChange={onChange}>
            <SelectTrigger className='flex rounded-md py-4'>
                Rol: <SelectValue className="font-bold"/>
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