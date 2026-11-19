import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parse } from 'dotenv';

/**
 * AISLAMIENTO: todas las pruebas e2e viven en este esquema de la BD local.
 * Nunca se toca `public`. El teardown elimina SOLO este esquema.
 */
export const E2E_SCHEMA = 'e2e_test';

export const BACKEND_ROOT = path.resolve(__dirname, '..', '..', '..');

/** URL base de la BD (de process.env o del .env); nunca se imprime. */
function readBaseDatabaseUrl(): string {
  const fromEnv = process.env.E2E_BASE_DATABASE_URL;
  if (fromEnv) return fromEnv;

  const envFile = path.join(BACKEND_ROOT, '.env');
  const parsed = fs.existsSync(envFile)
    ? parse(fs.readFileSync(envFile))
    : ({} as Record<string, string>);
  const url = parsed.DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no definida (.env)');
  return url;
}

function withParams(base: string, params: Record<string, string>) {
  const url = new URL(base);
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function buildUrls() {
  const base = readBaseDatabaseUrl();
  const plain = withParams(base, {});
  return {
    base: plain,
    // Para el CLI de Prisma (migrate deploy): parametro `schema`
    cli: withParams(base, { schema: E2E_SCHEMA }),
    // Para la app y los pg directos: search_path fijo al esquema de pruebas
    app: withParams(base, { options: `-c search_path=${E2E_SCHEMA}` }),
  };
}

/** Variables de entorno de la app bajo prueba (sin SMTP, secreto de test). */
export function applyTestEnv(urls: ReturnType<typeof buildUrls>) {
  process.env.E2E_BASE_DATABASE_URL = urls.base;
  process.env.DATABASE_URL = urls.app;
  process.env.DATABASE_SCHEMA = E2E_SCHEMA;
  process.env.JWT_SECRET ??= 'e2e-jwt-secret-' + 'x'.repeat(40);
  process.env.APP_TIMEZONE = 'America/Mexico_City';
  process.env.ON_PRODUCTION = 'false';
  process.env.NODE_ENV = 'test';
  process.env.TRUST_PROXY_HOPS = '1';
  process.env.COOKIE_SAMESITE = 'lax';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  // Sin SMTP: POST /auth/forgot-password debe responder 503
  process.env.SMTP_HOST = '';
  process.env.SMTP_USER = '';
  process.env.SMTP_PASS = '';
  process.env.STORAGE_DIR ??= path.join(os.tmpdir(), 'dentissa-e2e-storage');
}
