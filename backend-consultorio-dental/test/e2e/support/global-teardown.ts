import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Client } from 'pg';
import { E2E_SCHEMA, buildUrls } from './env';

export default async function globalTeardown() {
  // Verificacion doble del nombre antes de ejecutar el DROP
  const schema = E2E_SCHEMA;
  if (schema !== 'e2e_test' || !/^e2e_test$/.test(schema)) {
    throw new Error('Esquema de pruebas inesperado: no se elimina nada');
  }

  const client = new Client({ connectionString: buildUrls().base });
  await client.connect();
  try {
    if (schema === 'e2e_test') {
      await client.query(`DROP SCHEMA IF EXISTS "e2e_test" CASCADE`);
    }
  } finally {
    await client.end();
  }

  // Solo el directorio temporal creado por el setup
  const dir = process.env.E2E_STORAGE_DIR;
  if (
    dir &&
    path.dirname(dir) === os.tmpdir() &&
    path.basename(dir).startsWith('dentissa-e2e-')
  ) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
