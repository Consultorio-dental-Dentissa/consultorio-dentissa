/**
 * Zona horaria del consultorio (IANA). Configurable con APP_TIMEZONE.
 * Se usa para formatear horas y calcular los limites de un dia, de modo que
 * el resultado no dependa de la zona horaria del servidor.
 */
export const APP_TIMEZONE = process.env.APP_TIMEZONE || 'America/Mexico_City';

function getParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)!.value);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

/** Diferencia (ms) entre la hora local de la zona y UTC en ese instante. */
function getOffsetMs(date: Date, timeZone: string) {
  const p = getParts(date, timeZone);
  const asUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
  );

  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Instante UTC que corresponde a las 00:00 locales del dia indicado. */
function localMidnightToUtc(
  year: number,
  month: number,
  day: number,
  tz: string,
) {
  const guess = Date.UTC(year, month - 1, day);
  let result = guess - getOffsetMs(new Date(guess), tz);
  // Segunda pasada por si hubo cambio de horario entre el guess y el resultado
  result = guess - getOffsetMs(new Date(result), tz);

  return new Date(result);
}

/** Inicio (inclusive) y fin (exclusivo) del dia local que contiene a `date`. */
export function getDayBounds(date: Date, timeZone: string = APP_TIMEZONE) {
  const { year, month, day } = getParts(new Date(date), timeZone);
  const start = localMidnightToUtc(year, month, day, timeZone);
  // Date.UTC normaliza el desborde de dia/mes
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
  const end = localMidnightToUtc(
    nextDay.getUTCFullYear(),
    nextDay.getUTCMonth() + 1,
    nextDay.getUTCDate(),
    timeZone,
  );

  return { start, end };
}

/** Hora legible (HH:mm) en la zona del consultorio. */
export function formatTime(date: Date, timeZone: string = APP_TIMEZONE) {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(date));
}

/** Fecha y hora legibles (dd/MM/yyyy HH:mm) en la zona del consultorio. */
export function formatDateTime(date: Date, timeZone: string = APP_TIMEZONE) {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(date));
}
