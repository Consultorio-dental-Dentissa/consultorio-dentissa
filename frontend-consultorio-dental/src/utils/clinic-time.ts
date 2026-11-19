/**
 * Fechas en la zona horaria del consultorio (igual que el backend, APP_TIMEZONE).
 * Los días se representan como texto "AAAA-MM-DD" (day key): así la aritmética de
 * calendario no depende de la zona horaria del navegador.
 */
export const CLINIC_TIMEZONE: string = import.meta.env.VITE_CLINIC_TIMEZONE || "America/Mexico_City";

const LOCALE = "es-MX";

const PARTS_FORMAT = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
});

function partsOf(date: Date) {
    const parts = PARTS_FORMAT.formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    return {
        year: get("year"), month: get("month"), day: get("day"),
        hour: get("hour"), minute: get("minute"), second: get("second"),
    };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Día (AAAA-MM-DD) en que cae el instante, según la zona del consultorio. */
export function clinicDayKey(date: Date): string {
    const p = partsOf(date);
    return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function clinicTodayKey(now: Date = new Date()): string {
    return clinicDayKey(now);
}

/** Hora (0-23) y minuto del instante en la zona del consultorio. */
export function clinicHourMinute(date: Date): { hour: number; minute: number } {
    const p = partsOf(date);
    return { hour: p.hour, minute: p.minute };
}

function offsetMs(date: Date): number {
    const p = partsOf(date);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000;
}

/** Instante UTC que corresponde a la fecha y hora de pared dadas en la zona del consultorio. */
export function clinicDateTimeToDate(dayKey: string, time: string): Date {
    const [y, m, d] = dayKey.split("-").map(Number);
    const [h, min] = time.split(":").map(Number);
    const wall = Date.UTC(y, m - 1, d, h, min, 0);
    let guess = wall - offsetMs(new Date(wall));
    guess = wall - offsetMs(new Date(guess));
    return new Date(guess);
}

// ---- Aritmética de calendario sobre day keys ----

function keyToUtcNoon(key: string): Date {
    return new Date(`${key}T12:00:00Z`);
}

function utcToKey(date: Date): string {
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function addDays(key: string, days: number): string {
    const date = keyToUtcNoon(key);
    date.setUTCDate(date.getUTCDate() + days);
    return utcToKey(date);
}

export function addMonths(key: string, months: number): string {
    const date = keyToUtcNoon(key);
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + months);
    return utcToKey(date);
}

/** 0 = lunes ... 6 = domingo. */
export function weekdayIndex(key: string): number {
    return (keyToUtcNoon(key).getUTCDay() + 6) % 7;
}

export function startOfWeek(key: string): string {
    return addDays(key, -weekdayIndex(key));
}

export function startOfMonth(key: string): string {
    return `${key.slice(0, 7)}-01`;
}

export function endOfMonth(key: string): string {
    return addDays(addMonths(startOfMonth(key), 1), -1);
}

export function isSameMonth(a: string, b: string): boolean {
    return a.slice(0, 7) === b.slice(0, 7);
}

export function dayNumber(key: string): number {
    return Number(key.slice(8, 10));
}

/** Lista de días consecutivos (ambos extremos incluidos). */
export function daysBetween(from: string, to: string): string[] {
    const days: string[] = [];
    for (let day = from; day <= to; day = addDays(day, 1)) days.push(day);
    return days;
}

// ---- Formato (día de calendario, sin conversión de zona) ----

function formatKey(key: string, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: "UTC" }).format(keyToUtcNoon(key));
}

export function capitalize(text: string): string {
    return text.charAt(0).toLocaleUpperCase(LOCALE) + text.slice(1);
}

export const formatKeyWeekdayShort = (key: string) => capitalize(formatKey(key, { weekday: "short" }).replace(".", ""));
export const formatKeyWeekdayLong = (key: string) => capitalize(formatKey(key, { weekday: "long" }));
export const formatKeyMonthYear = (key: string) => capitalize(formatKey(key, { month: "long", year: "numeric" }));
export const formatKeyLong = (key: string) =>
    capitalize(formatKey(key, { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
export const formatKeyShort = (key: string) => formatKey(key, { day: "numeric", month: "short" }).replace(".", "");

// ---- Formato (instante, convertido a la zona del consultorio) ----

const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: CLINIC_TIMEZONE });

export function formatClinicTime(date: Date): string {
    return fmt({ hour: "2-digit", minute: "2-digit", hour12: true }).format(date);
}

export function formatClinicShortDate(date: Date | null | undefined): string {
    if (!date || Number.isNaN(date.getTime())) return "—";
    return fmt({ day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatClinicLongDate(date: Date): string {
    return capitalize(fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date));
}

export function formatClinicDateTime(date: Date): string {
    return `${formatClinicShortDate(date)}, ${formatClinicTime(date)}`;
}

/** "Hace 8 min", "Ayer", fecha corta si es más antigua. */
export function formatRelative(date: Date, now: Date = new Date()): string {
    const diffMin = Math.round((now.getTime() - date.getTime()) / 60_000);
    if (diffMin < 1) return "Justo ahora";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const days = Math.round(
        (keyToUtcNoon(clinicDayKey(now)).getTime() - keyToUtcNoon(clinicDayKey(date)).getTime()) / 86_400_000,
    );
    if (days === 1) return "Ayer";
    if (days > 1 && days < 7) return `Hace ${days} días`;
    return formatClinicDateTime(date);
}
