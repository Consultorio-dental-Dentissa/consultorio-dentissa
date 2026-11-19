import { registerDecorator, ValidationOptions } from 'class-validator';
import { getDayBounds } from './timezone';

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_ZONE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|[+-](\d{2}):(\d{2}))$/;

/** true si anio/mes/dia existen en el calendario (rechaza 2026-02-30). */
export function isRealCalendarDate(y: number, m: number, d: number) {
  if (m < 1 || m > 12 || d < 1) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/** AAAA-MM-DD que existe en el calendario. */
export function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const m = DATE_ONLY.exec(value);
  return !!m && isRealCalendarDate(+m[1], +m[2], +m[3]);
}

/** Fecha-hora ISO 8601 con zona explicita (Z u offset) y valores reales. */
export function isValidZonedDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const m = DATE_TIME_ZONE.exec(value);
  if (!m) return false;
  if (!isRealCalendarDate(+m[1], +m[2], +m[3])) return false;
  if (+m[4] > 23 || +m[5] > 59 || (m[6] !== undefined && +m[6] > 59)) {
    return false;
  }
  if (m[8] !== undefined && (+m[8] > 23 || +m[9] > 59)) return false;
  return !Number.isNaN(new Date(value).getTime());
}

/** Dia local (APP_TIMEZONE) al que pertenece una fecha AAAA-MM-DD valida. */
export function dayBoundsOf(value: string) {
  return getDayBounds(new Date(`${value}T12:00:00Z`));
}

/**
 * AAAA-MM-DD (inicio 00:00 / fin 23:59:59.999 locales) o ISO con zona.
 * Devuelve null si el formato o la fecha no son validos.
 */
export function parseDateInput(
  value: unknown,
  edge: 'start' | 'end',
): Date | null {
  if (isValidDateOnly(value)) {
    const b = dayBoundsOf(value);
    return edge === 'start' ? new Date(b.start) : new Date(b.end.getTime() - 1);
  }
  if (isValidZonedDateTime(value)) return new Date(value);
  return null;
}

/** Valida AAAA-MM-DD real o fecha-hora ISO con zona explicita. */
export function IsDateOrZonedDateTime(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isDateOrZonedDateTime',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) =>
          isValidDateOnly(value) || isValidZonedDateTime(value),
      },
    });
  };
}

/** Valida solo AAAA-MM-DD existente en el calendario. */
export function IsCalendarDate(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isCalendarDate',
      target: object.constructor,
      propertyName,
      options,
      validator: { validate: (value: unknown) => isValidDateOnly(value) },
    });
  };
}
