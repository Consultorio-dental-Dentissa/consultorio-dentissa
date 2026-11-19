import { CLINIC_TIMEZONE, clinicDayKey } from "@/utils/clinic-time";

const LOCALE = 'es-MX';

export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return '—';
    const clean = phone.trim();
    // Solo se agrupan teléfonos de 10 dígitos; otros formatos (con +) se muestran tal cual.
    if (/^\d{10}$/.test(clean)) {
        return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
    }
    return clean;
}

export function formatTotalMinutesToHours(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins} min`;
    return mins === 0 ? `${hours} h` : `${hours} h ${mins} min`;
}

/** Fecha larga ("10 de julio de 2026") del día en la zona del consultorio, no del navegador. */
export function formatDate(date: Date | null | undefined) {
    if (!date || Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(LOCALE, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: CLINIC_TIMEZONE,
    }).format(date);
}

export function formatShortDate(date: Date | null | undefined) {
    if (!date || Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(LOCALE, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: CLINIC_TIMEZONE,
    }).format(date);
}

export function formatTime(date: Date) {
    return new Intl.DateTimeFormat(LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: CLINIC_TIMEZONE,
    }).format(date);
}

export function formatDateTime(date: Date) {
    return `${formatShortDate(date)}, ${formatTime(date)}`;
}

export function formatCurrency(value: number | string) {
    const amount = Number(value);
    if (Number.isNaN(amount)) return '—';
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'MXN' }).format(amount);
}

/** Día (AAAA-MM-DD) del instante en la zona del consultorio, para `<input type="date">`. */
export function toDateInputValue(date: Date): string {
    return clinicDayKey(date);
}

/** Calcula la edad en años a partir de la fecha de nacimiento (días en zona del consultorio). */
export function calculateAge(birthDate: Date | null | undefined, now: Date = new Date()): number | null {
    if (!birthDate || Number.isNaN(birthDate.getTime())) return null;
    const [by, bm, bd] = clinicDayKey(birthDate).split('-').map(Number);
    const [ty, tm, td] = clinicDayKey(now).split('-').map(Number);
    let age = ty - by;
    if (tm < bm || (tm === bm && td < bd)) age -= 1;
    return age;
}

/** "mayo 2025" (mes y año en la zona del consultorio), para "Paciente desde" / "En Dentissa desde". */
export function formatMonthYear(date: Date | null | undefined) {
    if (!date || Number.isNaN(date.getTime())) return '—';
    const parts = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric', timeZone: CLINIC_TIMEZONE }).formatToParts(date);
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const year = parts.find((part) => part.type === 'year')?.value ?? '';
    return `${month} ${year}`.trim();
}
