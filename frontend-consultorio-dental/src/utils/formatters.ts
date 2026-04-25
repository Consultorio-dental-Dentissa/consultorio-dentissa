export function formatFirstLetterUppercase(role: string): string {
    role = role.trim();
    return role.charAt(0).toLocaleUpperCase() + role.slice(1).toLocaleLowerCase();
}

export function formatPhone(phone: string): string {
    phone = phone.trim();
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
}