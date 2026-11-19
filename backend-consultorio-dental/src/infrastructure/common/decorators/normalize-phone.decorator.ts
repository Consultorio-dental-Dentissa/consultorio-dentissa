import { Transform } from 'class-transformer';

/**
 * Deja solo digitos y un "+" inicial opcional (quita espacios, guiones,
 * parentesis, puntos y cualquier otro caracter). "(55) 1234-5678" -> "5551234567".
 */
export function normalizePhone(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

/** Normaliza el telefono antes de validarlo (el unico formato guardado en BD). */
export const NormalizePhone = () =>
  Transform(({ value }: { value: unknown }) => normalizePhone(value));
