import { randomBytes } from 'crypto';
import { Http, Session, cookieHeader, cookiesFrom } from './app';

/** PNG minimo valido para el validador (firma de 8 bytes + relleno). */
export function pngBuffer(extra = 32) {
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    randomBytes(extra),
  ]);
}

export function jpegBuffer() {
  return Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    randomBytes(32),
  ]);
}

let counter = 0;
const runId = randomBytes(3).toString('hex');

export function uniq(prefix = 'x') {
  counter += 1;
  return `${prefix}${runId}${counter}`;
}

let phoneSeq = Math.floor(Math.random() * 80_000_000);
/** Telefono de 10 digitos, unico en la corrida. */
export function uniquePhone() {
  phoneSeq += 1;
  return `55${String(10_000_000 + phoneSeq).padStart(8, '0')}`;
}

export const PASSWORD = 'Contrasena-Segura-123';

export const ADMIN_EMAIL = 'admin.e2e@example.com';

export async function login(
  api: Http,
  email: string,
  password: string,
): Promise<Session> {
  const res = await api.post('/auth/login').send({ email, password });
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`login fallo (${res.status}) para ${email}`);
  }
  const { access, refresh } = cookiesFrom(res);
  return {
    cookie: cookieHeader(access, refresh),
    access,
    refresh,
    user: { id: res.body.data.user.id, role: res.body.data.user.role, email },
  };
}

export function loginAdmin(api: Http) {
  return login(api, ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD!);
}

export interface TestPatient {
  session: Session;
  userId: number;
  patientId: number;
  email: string;
  phone: string;
  password: string;
}

export function patientPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Paciente',
    lastname: uniq('Prueba'),
    email: `${uniq('pac')}@example.com`,
    phone: uniquePhone(),
    password: PASSWORD,
    patient: {
      address: 'Calle Falsa 123',
      birth_date: '1990-05-20',
      emergency_phone: '5512345678',
    },
    ...overrides,
  };
}

/** Registra un paciente por el endpoint publico y abre sesion. */
export async function registerPatient(api: Http): Promise<TestPatient> {
  const payload = patientPayload();
  const reg = await api.post('/auth/register').send(payload);
  if (reg.status !== 201) {
    throw new Error(`registro fallo (${reg.status}): ${reg.body?.message}`);
  }
  const session = await login(api, payload.email, payload.password);
  const me = await api.get('/auth/me', session);
  return {
    session,
    userId: me.body.data.id,
    patientId: me.body.data.patient_id,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
  };
}

export async function createStaff(
  api: Http,
  admin: Session,
  role: 'ASISTENTE' | 'ADMINISTRADOR' = 'ASISTENTE',
) {
  const email = `${uniq('staff')}@example.com`;
  const res = await api.post('/users', admin).send({
    name: 'Personal',
    lastname: uniq('Prueba'),
    email,
    phone: uniquePhone(),
    password: PASSWORD,
    role,
  });
  if (res.status !== 201) {
    throw new Error(
      `crear usuario fallo (${res.status}): ${res.body?.message}`,
    );
  }
  const session = await login(api, email, PASSWORD);
  return { session, userId: res.body.data.id as number, email };
}

/** Crea un servicio (nace inactivo), sube una imagen y lo activa. */
export async function createActiveService(
  api: Http,
  admin: Session,
  durationMinutes = 30,
) {
  const created = await api.post('/services', admin).send({
    name: uniq('Servicio '),
    durationMinutes,
    description: 'Servicio de prueba e2e',
    price: 100,
  });
  if (created.status !== 201) {
    throw new Error(
      `crear servicio fallo (${created.status}): ${created.body?.message}`,
    );
  }
  const id = created.body.data.id as number;
  const img = await api
    .post(`/services/${id}/images`, admin)
    .attach('images', pngBuffer(), {
      filename: 'a.png',
      contentType: 'image/png',
    });
  if (img.status !== 201) {
    throw new Error(
      `subir imagen de servicio fallo (${img.status}): ${img.body?.message}`,
    );
  }
  const act = await api
    .patch(`/services/status/${id}`, admin)
    .send({ status: true });
  if (act.status !== 200) {
    throw new Error(`activar servicio fallo (${act.status})`);
  }
  return { id, name: created.body.data.name as string, durationMinutes };
}

const HOUR = 3_600_000;

/**
 * Asignador de horarios futuros SIN solape entre archivos de prueba: la agenda
 * es global (EXCLUDE sin recurso), asi que cada archivo usa su propia ventana
 * de 10 dias y cada bloque dura 3 horas.
 */
export function makeAgenda(fileKey: number) {
  const now = new Date();
  const base = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 30 + fileKey * 10,
    14,
    0,
    0,
    0,
  );
  let next = 0;
  return {
    /** Inicio del bloque n. */
    slot: (n: number, extraMinutes = 0) =>
      new Date(base + n * 3 * HOUR + extraMinutes * 60_000),
    /** Siguiente bloque libre del archivo. */
    next: (extraMinutes = 0) =>
      new Date(base + next++ * 3 * HOUR + extraMinutes * 60_000),
  };
}

export async function createAppointment(
  api: Http,
  who: Session,
  data: { serviceId: number; at: Date; patientId?: number; notes?: string },
) {
  return api.post('/appointments', who).send({
    scheduled_at: data.at.toISOString(),
    notes: data.notes ?? 'nota de prueba',
    service_id: data.serviceId,
    ...(data.patientId ? { patient_id: data.patientId } : {}),
  });
}

/** Falla con el cuerpo de la respuesta (mensaje del backend) si el estado no es el esperado. */
export function expectStatus(
  res: { status: number; body: unknown },
  expected: number,
) {
  if (res.status !== expected) {
    throw new Error(
      `Se esperaba HTTP ${expected} y se recibio ${res.status}: ${JSON.stringify(res.body)}`,
    );
  }
}

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
