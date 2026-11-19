import { formatTime, getDayBounds } from './timezone';

describe('timezone', () => {
  it('formatea la hora en la zona indicada, no en la del servidor', () => {
    const d = new Date(Date.UTC(2030, 0, 10, 16, 5));
    expect(formatTime(d, 'America/Mexico_City')).toBe('10:05');
    expect(formatTime(d, 'UTC')).toBe('16:05');
  });

  it('los limites del dia son medianoche local (UTC-6) y no mutan la fecha', () => {
    const d = new Date(Date.UTC(2030, 0, 10, 3, 0)); // 9 de enero 21:00 local
    const copy = d.getTime();
    const { start, end } = getDayBounds(d, 'America/Mexico_City');

    expect(start.toISOString()).toBe('2030-01-09T06:00:00.000Z');
    expect(end.toISOString()).toBe('2030-01-10T06:00:00.000Z');
    expect(d.getTime()).toBe(copy);
  });
});
