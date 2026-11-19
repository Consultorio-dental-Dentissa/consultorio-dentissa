import { Prisma } from '@prisma/client';

/**
 * Claves que nunca deben quedar en la auditoria: credenciales, tokens y
 * texto clinico libre. Se comparan en minusculas y por coincidencia parcial.
 */
const SENSITIVE_KEY_PARTS = [
  'password',
  'passwd',
  'token',
  'secret',
  'hash',
  'cookie',
  'authorization',
  'notes',
  'observations',
  'diagnos',
  'treatment',
  'reason',
];

const MAX_DEPTH = 4;
const MAX_STRING_LENGTH = 300;

function isSensitiveKey(key: string) {
  const lower = key.toLowerCase();
  return SENSITIVE_KEY_PARTS.some((part) => lower.includes(part));
}

function sanitizeValue(value: unknown, depth: number): Prisma.JsonValue {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}...`
      : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Prisma.Decimal) return value.toString();
  if (depth >= MAX_DEPTH) return null;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof value === 'object') {
    return sanitizeAuditData(value as Record<string, unknown>, depth + 1);
  }
  return null;
}

/** Devuelve una copia del objeto sin claves sensibles (recursivo y acotado). */
export function sanitizeAuditData(
  data: Record<string, unknown>,
  depth = 0,
): { [key: string]: Prisma.JsonValue } {
  const result: { [key: string]: Prisma.JsonValue } = {};

  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key)) continue;
    result[key] = sanitizeValue(value, depth);
  }

  return result;
}
