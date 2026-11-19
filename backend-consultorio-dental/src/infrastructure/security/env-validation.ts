const INSECURE_DEV_SECRET = 'dentissa-dev-secret-cambiar';
const MIN_PRODUCTION_SECRET_LENGTH = 32;

export function isProduction(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === 'production' || env.ON_PRODUCTION === 'true';
}

/** Lanza si JWT_SECRET falta o, en produccion, es el valor de ejemplo o es corto. */
export function assertJwtSecret(env: NodeJS.ProcessEnv = process.env): void {
  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET no definida: configúrala en el entorno');
  }

  if (isProduction(env)) {
    if (secret === INSECURE_DEV_SECRET) {
      throw new Error(
        'JWT_SECRET usa el valor de ejemplo: define un secreto propio en producción',
      );
    }

    if (secret.length < MIN_PRODUCTION_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET debe tener al menos ${MIN_PRODUCTION_SECRET_LENGTH} caracteres en producción`,
      );
    }
  }
}

/** Numero de proxies de confianza (default 0). Nunca acepta `true`. */
export function parseTrustProxyHops(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = env.TRUST_PROXY_HOPS;

  if (raw === undefined || raw.trim() === '') {
    return 0;
  }

  if (!/^\d+$/.test(raw.trim())) {
    throw new Error('TRUST_PROXY_HOPS debe ser un entero mayor o igual a 0');
  }

  return Number(raw.trim());
}
