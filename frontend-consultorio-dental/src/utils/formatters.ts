export function formatFirstLetterUppercase(role: string): string {
    role = role.trim();
    return role.charAt(0).toLocaleUpperCase() + role.slice(1).toLocaleLowerCase();
}

export function formatPhone(phone: string): string {
    phone = phone.trim();
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
}

export function formatTotalMinutesToHours(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours}h ${mins}m`
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat('es-MX', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

export function toLocalDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseLocalDateString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}