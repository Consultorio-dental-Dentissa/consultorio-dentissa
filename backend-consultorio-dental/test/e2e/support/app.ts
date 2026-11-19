import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request from 'supertest';
import { E2E_SCHEMA } from './env';
import { PrismaService } from '../../../src/infrastructure/prisma/prisma.service';
import { MailService } from '../../../src/infrastructure/mail/mail.service';
import { AppModule } from '../../../src/app.module';
import { configureApp } from '../../../src/app.setup';

export interface Session {
  /** Valor para la cabecera Cookie (access + refresh). */
  cookie: string;
  access: string;
  refresh: string;
  user: { id: number; role: string; email: string };
}

let ipCounter = Math.floor(Math.random() * 200);

/** IP unica por peticion (X-Forwarded-For con trust proxy = 1): evita el rate limit entre pruebas. */
export function freshIp() {
  ipCounter += 1;
  return `10.${(ipCounter >> 16) & 255}.${(ipCounter >> 8) & 255}.${ipCounter & 255}`;
}

let pool: Pool | null = null;

/** Pool pg directo contra el esquema de pruebas (para verificar y forzar estados). */
export function db() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
  }
  return pool;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/** Crea la app Nest real (AppModule) con la misma configuracion HTTP que main.ts. */
export async function createApp(options?: {
  /** Sustituye el MailService (p. ej. para capturar el token de recuperacion). */
  mail?: {
    isConfigured: () => boolean;
    sendPasswordResetEmail: (...args: any[]) => Promise<boolean>;
  };
}): Promise<INestApplication> {
  let builder = Test.createTestingModule({ imports: [AppModule] });
  if (options?.mail) {
    builder = builder.overrideProvider(MailService).useValue(options.mail);
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication({ bodyParser: false });
  configureApp(app);
  await app.init();

  // Garantia de aislamiento: Prisma (adapter-pg) debe consultar el esquema de
  // pruebas y NO "public". El admin e2e solo existe en el esquema de pruebas.
  const prisma = app.get(PrismaService);
  const seeded = await prisma.user.findFirst({
    where: { email: 'admin.e2e@example.com' },
    select: { id: true },
  });
  const { rows } = await db().query('SELECT current_schema() AS s');
  if (!seeded || rows[0].s !== E2E_SCHEMA) {
    await app.close();
    throw new Error('La app no apunta al esquema de pruebas');
  }

  return app;
}

type Method = 'get' | 'post' | 'patch' | 'put' | 'delete';

/** Cliente HTTP (supertest). Cada llamada usa una IP distinta salvo que se indique. */
export function http(app: INestApplication) {
  const make =
    (method: Method) =>
    (url: string, session?: Session | null, ip?: string) => {
      let req = request(app.getHttpServer())[method](url);
      req = req.set('X-Forwarded-For', ip ?? freshIp());
      if (session) req = req.set('Cookie', session.cookie);
      return req;
    };

  return {
    get: make('get'),
    post: make('post'),
    patch: make('patch'),
    put: make('put'),
    delete: make('delete'),
  };
}
export type Http = ReturnType<typeof http>;

/** Extrae las cookies de sesion de una respuesta de login/refresh. */
export function cookiesFrom(res: { headers: Record<string, any> }) {
  const raw = (res.headers['set-cookie'] ?? []) as string[];
  const pick = (name: string) => {
    const line = raw.find((c) => c.startsWith(`${name}=`));
    return line ? line.split(';')[0].slice(name.length + 1) : '';
  };
  return { access: pick('access_token'), refresh: pick('refresh_token'), raw };
}

export function cookieHeader(access: string, refresh: string) {
  return `access_token=${access}; refresh_token=${refresh}`;
}
