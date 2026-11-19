import type { CookieOptions } from 'express';

type SameSite = 'lax' | 'strict' | 'none';

export function isProduction(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.ON_PRODUCTION === 'true'
  );
}

/**
 * Opciones base de las cookies de sesion. `secure` en produccion y `sameSite`
 * configurable con COOKIE_SAMESITE (lax por defecto). SameSite=None exige secure.
 */
export function baseCookieOptions(): CookieOptions {
  const configured = (process.env.COOKIE_SAMESITE ?? 'lax').toLowerCase();
  const sameSite: SameSite = ['lax', 'strict', 'none'].includes(configured)
    ? (configured as SameSite)
    : 'lax';

  return {
    httpOnly: true,
    secure: isProduction() || sameSite === 'none',
    sameSite,
  };
}
