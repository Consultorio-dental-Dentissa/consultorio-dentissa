import * as z from "zod";

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 72;

/** Quita espacios, guiones y paréntesis; conserva dígitos y un "+" inicial. */
export function normalizePhone(value: string): string {
    const trimmed = value.trim();
    const plus = trimmed.startsWith("+") ? "+" : "";
    return plus + trimmed.replace(/\D/g, "");
}

export const requiredText = (label: string, max = 100) =>
    z
        .string()
        .trim()
        .min(1, `${label} es obligatorio`)
        .max(max, `${label} debe tener máximo ${max} caracteres`);

export const emailSchema = z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido, por ejemplo nombre@dominio.com");

export const passwordSchema = z
    .string()
    .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
    .max(PASSWORD_MAX_LENGTH, `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres`);

export const phoneSchema = (label = "El teléfono") =>
    z
        .string()
        .trim()
        .min(1, `${label} es obligatorio`)
        .refine((value) => {
            const digits = normalizePhone(value).replace(/\D/g, "");
            return digits.length >= 10 && digits.length <= 15;
        }, `${label} debe tener entre 10 y 15 dígitos`)
        .refine(
            (value) => /^[+\d\s()-]+$/.test(value),
            `${label} solo puede contener números`,
        );

export const birthDateSchema = z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine((value) => {
        const date = new Date(`${value}T00:00:00`);
        return !Number.isNaN(date.getTime()) && date <= new Date();
    }, "La fecha de nacimiento no puede ser futura");
