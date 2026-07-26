import { ToothStatus } from "@/types/enums/tooth-status.enum";

export const TOOTH_STATUS_OPTIONS: { value: ToothStatus; label: string; color: string }[] = [
    { value: ToothStatus.SANO, label: 'Sano', color: 'bg-white' },
    { value: ToothStatus.CARIES, label: 'Caries', color: 'bg-black' },
    { value: ToothStatus.OBTURADO, label: 'Obturado', color: 'bg-blue-500' },
    { value: ToothStatus.AUSENTE, label: 'Ausente', color: 'bg-gray-300' },
    { value: ToothStatus.EXTRAIDO, label: 'Extraído', color: 'bg-red-500' },
    { value: ToothStatus.CORONA, label: 'Corona', color: 'bg-amber-400' },
    { value: ToothStatus.IMPLANTE, label: 'Implante', color: 'bg-purple-500' },
];

export function getToothStatusOption(status: ToothStatus) {
    return TOOTH_STATUS_OPTIONS.find(option => option.value === status) ?? TOOTH_STATUS_OPTIONS[0];
}
