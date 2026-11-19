import { execFileSync } from 'child_process';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Client } from 'pg';
import { BACKEND_ROOT, E2E_SCHEMA, applyTestEnv, buildUrls } from './env';

/** Solo el esquema de pruebas puede crearse/eliminarse desde aqui. */
function assertTestSchema(name: string) {
  if (name !== 'e2e_test' || E2E_SCHEMA !== 'e2e_test') {
    throw new Error('Esquema de pruebas inesperado: se aborta por seguridad');
  }
}

export default async function globalSetup() {
  assertTestSchema(E2E_SCHEMA);
  const urls = buildUrls();

  const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dentissa-e2e-'));
  process.env.STORAGE_DIR = storageDir;
  process.env.E2E_STORAGE_DIR = storageDir;
  // Contraseña aleatoria del admin de pruebas (>= 10 caracteres)
  process.env.E2E_ADMIN_PASSWORD = `Adm!${crypto.randomBytes(12).toString('hex')}`;
  applyTestEnv(urls);

  // 1) Esquema limpio (si quedo uno de una corrida interrumpida, se recrea)
  const admin = new Client({ connectionString: urls.base });
  await admin.connect();
  try {
    assertTestSchema(E2E_SCHEMA);
    await admin.query(`DROP SCHEMA IF EXISTS "e2e_test" CASCADE`);
    await admin.query(`CREATE SCHEMA "e2e_test"`);
  } finally {
    await admin.end();
  }

  // 2) Migraciones reales (incluye EXCLUDE, indices parciales y trigger)
  execFileSync(
    process.execPath,
    [
      path.join(BACKEND_ROOT, 'node_modules', 'prisma', 'build', 'index.js'),
      'migrate',
      'deploy',
    ],
    {
      cwd: BACKEND_ROOT,
      env: { ...process.env, DATABASE_URL: urls.cli },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  // 3) Seed minimo: roles + admin
  const db = new Client({ connectionString: urls.app });
  await db.connect();
  try {
    const schema = await db.query('SELECT current_schema() AS s');
    if (schema.rows[0].s !== E2E_SCHEMA) {
      throw new Error('La conexion no apunta al esquema de pruebas');
    }
    for (const role of ['ADMINISTRADOR', 'ASISTENTE', 'PACIENTE']) {
      await db.query('INSERT INTO roles (role) VALUES ($1)', [role]);
    }
    const hash = await bcrypt.hash(process.env.E2E_ADMIN_PASSWORD, 10);
    await db.query(
      `INSERT INTO users (name, lastname, email, phone, password, role_id)
       VALUES ('Admin', 'E2E', 'admin.e2e@example.com', '5500000000', $1,
               (SELECT id FROM roles WHERE role = 'ADMINISTRADOR'))`,
      [hash],
    );
  } finally {
    await db.end();
  }
}
