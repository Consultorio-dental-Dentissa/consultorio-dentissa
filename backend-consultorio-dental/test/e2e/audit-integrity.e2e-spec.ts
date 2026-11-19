import type { INestApplication } from '@nestjs/common';
import { Http, Session, closeDb, createApp, db, http } from './support/app';
import {
  PASSWORD,
  createActiveService,
  expectStatus,
  loginAdmin,
  registerPatient,
  uniq,
  uniquePhone,
} from './support/factory';

const SECRET_NOTE = 'NOTA-CLINICA-PRIVADA-QWE';

/** Postgres devuelve el codigo SQLSTATE y el nombre de la restriccion. */
async function expectDbError(
  sql: string,
  params: unknown[],
  code: string,
  constraint?: string,
) {
  let error: { code?: string; constraint?: string; message?: string } | null =
    null;
  try {
    await db().query(sql, params);
  } catch (e) {
    error = e as typeof error;
  }
  expect(error).not.toBeNull();
  expect(error!.code).toBe(code);
  if (constraint) expect(error!.constraint).toBe(constraint);
  return error!;
}

describe('Auditoria (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  let admin: Session;

  beforeAll(async () => {
    app = await createApp();
    api = http(app);
    admin = await loginAdmin(api);
  }, 120000);

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  it('registra quien, que accion y sobre que entidad, y se consulta con filtros y paginacion', async () => {
    const staffPassword = 'Personal-Secreta-123';
    const created = await api.post('/users', admin).send({
      name: 'Aud',
      lastname: uniq('Itoria'),
      email: `${uniq('aud')}@example.com`,
      phone: uniquePhone(),
      password: staffPassword,
      role: 'ASISTENTE',
    });
    expectStatus(created, 201);
    const userId = created.body.data.id as number;
    expectStatus(
      await api.patch(`/users/status/${userId}`, admin).send({ estado: false }),
      200,
    );
    const service = await createActiveService(api, admin);

    const byEntity = await api.get(
      `/audit-logs?entity=USER&entityId=${userId}`,
      admin,
    );
    expectStatus(byEntity, 200);
    const actions = byEntity.body.data.items.map(
      (r: { action: string }) => r.action,
    );
    expect(actions).toEqual(
      expect.arrayContaining(['USER_CREATED', 'USER_STATUS_CHANGED']),
    );
    for (const item of byEntity.body.data.items) {
      expect(item.entity_id).toBe(userId);
      expect(item.user_id ?? item.user?.id).toBe(admin.user.id);
      expect(item.created_at).toBeTruthy();
    }
    const statusChange = byEntity.body.data.items.find(
      (r: { action: string }) => r.action === 'USER_STATUS_CHANGED',
    );
    expect(statusChange.before).toEqual({ status: true });
    expect(statusChange.after).toEqual({ status: false });

    const svc = await api.get(
      `/audit-logs?entity=SERVICE&entityId=${service.id}`,
      admin,
    );
    expect(
      svc.body.data.items.map((r: { action: string }) => r.action),
    ).toEqual(
      expect.arrayContaining([
        'SERVICE_CREATED',
        'SERVICE_IMAGE_ADDED',
        'SERVICE_STATUS_CHANGED',
      ]),
    );

    // filtros: accion, usuario, rango de fechas y paginacion
    const byAction = await api.get(
      `/audit-logs?action=USER_CREATED&userId=${admin.user.id}&limit=1&page=1`,
      admin,
    );
    expect(byAction.body.data.items).toHaveLength(1);
    expect(byAction.body.data.limit).toBe(1);
    expect(byAction.body.data.total).toBeGreaterThanOrEqual(1);
    expect(byAction.body.data.items[0].action).toBe('USER_CREATED');
    const today = new Date().toISOString().slice(0, 10);
    const inRange = await api.get(
      `/audit-logs?entity=USER&entityId=${userId}&from=${today}`,
      admin,
    );
    expect(inRange.body.data.total).toBeGreaterThanOrEqual(2);
    const future = await api.get(
      `/audit-logs?entity=USER&entityId=${userId}&from=2099-01-01`,
      admin,
    );
    expect(future.body.data.total).toBe(0);
    expect(
      (await api.get('/audit-logs?from=2024-02-02&to=2024-01-01', admin))
        .status,
    ).toBe(400);
    expect((await api.get('/audit-logs?from=ayer', admin)).status).toBe(400);
    expect((await api.get('/audit-logs?limit=101', admin)).status).toBe(400);
  });

  it('una operacion que falla (rollback) no deja auditoria', async () => {
    const before = await db().query(
      'SELECT count(*)::int AS n FROM audit_logs',
    );
    const unknown = await api
      .patch('/services/status/999999', admin)
      .send({ status: true });
    expect(unknown.status).toBe(404);
    const dupEmail = await api.post('/users', admin).send({
      name: 'X',
      lastname: 'Y',
      email: 'admin.e2e@example.com',
      phone: uniquePhone(),
      password: PASSWORD,
      role: 'ASISTENTE',
    });
    expect(dupEmail.status).toBe(400);
    const after = await db().query('SELECT count(*)::int AS n FROM audit_logs');
    expect(after.rows[0].n).toBe(before.rows[0].n);
  });

  it('nunca guarda contrasenas, hashes, tokens ni datos clinicos (barrido de toda la tabla)', async () => {
    // Genera acciones sensibles: alta con contrasena, cambio y reset, consulta con texto clinico
    const p = await registerPatient(api);
    const newPass = 'Cambiada-Secreta-999';
    await new Promise((r) => setTimeout(r, 1100));
    expectStatus(
      await api
        .patch('/auth/password', p.session)
        .send({ currentPassword: p.password, newPassword: newPass }),
      200,
    );

    const service = await createActiveService(api, admin);
    const appt = await api.post('/appointments', admin).send({
      scheduled_at: new Date(Date.now() + 400 * 86_400_000).toISOString(),
      notes: SECRET_NOTE,
      service_id: service.id,
      patient_id: p.patientId,
    });
    expectStatus(appt, 201);
    const apptId = appt.body.data.id as number;
    expectStatus(
      await api.patch(`/appointments/${apptId}/confirm`, admin),
      200,
    );
    await db().query(
      'UPDATE appointments SET scheduled_at = $1 WHERE id = $2',
      [new Date(Date.UTC(2018, 5, 1)).toISOString(), apptId],
    );
    expectStatus(
      await api.patch(`/appointments/${apptId}/complete`, admin),
      200,
    );
    const cons = await api.post('/consultations', admin).send({
      appointment_id: apptId,
      description: SECRET_NOTE,
      dentistObservations: SECRET_NOTE,
    });
    expectStatus(cons, 201);
    expectStatus(
      await api
        .patch(`/consultations/${cons.body.data.id}`, admin)
        .send({ description: `${SECRET_NOTE} v2` }),
      200,
    );
    const cancelled = await api.post('/appointments', admin).send({
      scheduled_at: new Date(Date.now() + 401 * 86_400_000).toISOString(),
      notes: SECRET_NOTE,
      service_id: service.id,
      patient_id: p.patientId,
    });
    expectStatus(
      await api
        .patch(`/appointments/${cancelled.body.data.id}/cancel`, admin)
        .send({ reason: SECRET_NOTE }),
      200,
    );

    const { rows } = await db().query(
      `SELECT id, action, coalesce(before::text,'') || coalesce(after::text,'') AS payload
       FROM audit_logs`,
    );
    expect(rows.length).toBeGreaterThan(10);
    const forbidden = [
      SECRET_NOTE,
      newPass,
      p.password,
      PASSWORD,
      'Personal-Secreta-123',
      process.env.E2E_ADMIN_PASSWORD!,
      p.session.access,
      p.session.refresh,
    ];
    const leaks = rows.filter(
      (r) =>
        forbidden.some((f) => r.payload.includes(f)) ||
        /\$2[aby]\$\d\d\$/.test(r.payload) ||
        /"(password|token|token_hash|notes|observations|description)"\s*:/i.test(
          r.payload,
        ),
    );
    expect(leaks.map((l) => l.action)).toEqual([]);

    // y tampoco por la API de consulta
    const api1 = await api.get('/audit-logs?limit=100', admin);
    const text = JSON.stringify(api1.body);
    expect(text).not.toContain(SECRET_NOTE);
    expect(text).not.toMatch(/\$2[aby]\$/);
    expect(text).not.toMatch(/"password"/);
  });

  it('solo el ADMIN consulta la auditoria y no existen endpoints para editarla o borrarla', async () => {
    expect((await api.get('/audit-logs')).status).toBe(401);
    const p = await registerPatient(api);
    expect((await api.get('/audit-logs', p.session)).status).toBe(403);
    for (const m of ['post', 'patch', 'put', 'delete'] as const) {
      for (const url of ['/audit-logs', '/audit-logs/1']) {
        const res = await api[m](url, admin).send({});
        expect([m, url, res.status]).toEqual([m, url, 404]);
      }
    }
  });

  describe('inmutabilidad a nivel de BD (trigger)', () => {
    it('UPDATE, DELETE y TRUNCATE sobre audit_logs estan bloqueados', async () => {
      const { rows } = await db().query(
        'SELECT id FROM audit_logs ORDER BY id LIMIT 1',
      );
      expect(rows).toHaveLength(1);
      const id = rows[0].id;
      const before = (
        await db().query('SELECT count(*)::int AS n FROM audit_logs')
      ).rows[0].n;

      const upd = await expectDbError(
        `UPDATE audit_logs SET action = 'MANIPULADO' WHERE id = $1`,
        [id],
        '23001', // restrict_violation
      );
      expect(upd.message).toMatch(/solo anadir/i);
      await expectDbError(
        'DELETE FROM audit_logs WHERE id = $1',
        [id],
        '23001',
      );
      await expectDbError('DELETE FROM audit_logs', [], '23001');
      await expectDbError(
        `TRUNCATE TABLE "e2e_test"."audit_logs"`,
        [],
        '23001',
      );

      const after = (
        await db().query('SELECT count(*)::int AS n FROM audit_logs')
      ).rows[0].n;
      expect(after).toBe(before);
      const still = await db().query(
        'SELECT action FROM audit_logs WHERE id = $1',
        [id],
      );
      expect(still.rows[0].action).not.toBe('MANIPULADO');
    });

    it('un usuario con auditoria no se puede borrar (FK RESTRICT)', async () => {
      const { rows } = await db().query(
        'SELECT user_id FROM audit_logs WHERE user_id IS NOT NULL LIMIT 1',
      );
      await expectDbError(
        'DELETE FROM users WHERE id = $1',
        [rows[0].user_id],
        '23001',
      );
    });
  });
});

describe('Integridad de la base de datos (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  let admin: Session;
  let patientId: number;
  let serviceId: number;
  let seq = 0;

  /** Cita insertada por SQL (esquivando la logica de la app) para probar el EXCLUDE. */
  const insertAppt = (
    startIso: string,
    status: string,
    minutes = 30,
    pid = patientId,
  ) =>
    db().query(
      `INSERT INTO appointments (scheduled_at, "durationMinutes", status, notes, patient_id, service_id, updated_at)
       VALUES ($1, $2, $3::"AppointmentStatus", 'sql', $4, $5, now())
       RETURNING id`,
      [startIso, minutes, status, pid, serviceId],
    );

  /** Ventana unica por prueba (anios 2030+), sin tocar la agenda de otros archivos. */
  const windowStart = () => {
    seq += 1;
    return Date.UTC(2031, 0, 1, 10) + seq * 86_400_000;
  };
  const at = (base: number, minutes: number) =>
    new Date(base + minutes * 60_000).toISOString();

  beforeAll(async () => {
    app = await createApp();
    api = http(app);
    admin = await loginAdmin(api);
    const p = await registerPatient(api);
    patientId = p.patientId;
    serviceId = (await createActiveService(api, admin)).id;
  }, 120000);

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  it('las migraciones se aplicaron en el esquema de pruebas (no en public)', async () => {
    const { rows } = await db().query(
      `SELECT conname FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
       WHERE n.nspname = 'e2e_test' AND conname = 'appointments_no_overlap'`,
    );
    expect(rows).toHaveLength(1);
    const idx = await db().query(
      `SELECT indexname FROM pg_indexes WHERE schemaname = 'e2e_test'
       AND indexname IN ('users_phone_key', 'services_name_key')`,
    );
    expect(idx.rows.map((r) => r.indexname).sort()).toEqual([
      'services_name_key',
      'users_phone_key',
    ]);
    const trg = await db().query(
      `SELECT tgname FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'e2e_test' AND c.relname = 'audit_logs' AND NOT t.tgisinternal`,
    );
    expect(trg.rows.map((r) => r.tgname).sort()).toEqual([
      'audit_logs_no_truncate',
      'audit_logs_no_update_delete',
    ]);
  });

  describe('UNIQUE', () => {
    it('services.name unico (por SQL)', async () => {
      const name = uniq('Unico ');
      const sql = `INSERT INTO services (name, "durationMinutes", price, description, status)
                   VALUES ($1, 30, 10, 'd', false)`;
      await db().query(sql, [name]);
      await expectDbError(sql, [name], '23505', 'services_name_key');
    });

    it('users.phone unico, pero varios usuarios sin telefono (NULL) son validos', async () => {
      const phone = uniquePhone();
      const sql = `INSERT INTO users (name, lastname, email, phone, password, role_id)
                   VALUES ('A','B',$1,$2,'x',(SELECT id FROM roles WHERE role='PACIENTE'))`;
      await db().query(sql, [`${uniq('t')}@example.com`, phone]);
      await expectDbError(
        sql,
        [`${uniq('t')}@example.com`, phone],
        '23505',
        'users_phone_key',
      );
      await db().query(sql, [`${uniq('n')}@example.com`, null]);
      await db().query(sql, [`${uniq('n')}@example.com`, null]);
    });

    it('users.email unico y consultation.appointment_id unico', async () => {
      const email = `${uniq('e')}@example.com`;
      const sql = `INSERT INTO users (name, lastname, email, phone, password, role_id)
                   VALUES ('A','B',$1,$2,'x',(SELECT id FROM roles WHERE role='PACIENTE'))`;
      await db().query(sql, [email, uniquePhone()]);
      await expectDbError(
        sql,
        [email, uniquePhone()],
        '23505',
        'users_email_key',
      );

      const appt = await insertAppt(at(windowStart(), 0), 'COMPLETADA');
      const cons = `INSERT INTO consultations (notes, observations, appointment_id) VALUES ('n','o',$1)`;
      await db().query(cons, [appt.rows[0].id]);
      await expectDbError(
        cons,
        [appt.rows[0].id],
        '23505',
        'consultations_appointment_id_key',
      );
    });
  });

  describe('CHECK', () => {
    it('servicios: duracion > 0 y precio >= 0', async () => {
      const sql = `INSERT INTO services (name, "durationMinutes", price, description, status)
                   VALUES ($1, $2, $3, 'd', false)`;
      await expectDbError(
        sql,
        [uniq('c'), 0, 10],
        '23514',
        'services_duration_minutes_positive',
      );
      await expectDbError(
        sql,
        [uniq('c'), -5, 10],
        '23514',
        'services_duration_minutes_positive',
      );
      await expectDbError(
        sql,
        [uniq('c'), 30, -1],
        '23514',
        'services_price_non_negative',
      );
      await db().query(sql, [uniq('c'), 30, 0]); // precio 0 es valido
    });

    it('ofertas: inicio <= fin; citas: duracion > 0', async () => {
      const sql = `INSERT INTO offers (name, description, start_date, end_date, status, updated_at)
                   VALUES ('o','d',$1,$2,false, now())`;
      await expectDbError(
        sql,
        ['2031-02-02T00:00:00Z', '2031-02-01T00:00:00Z'],
        '23514',
        'offers_date_range_valid',
      );
      await db().query(sql, ['2031-02-01T00:00:00Z', '2031-02-01T00:00:00Z']);
      await expectDbError(
        `INSERT INTO appointments (scheduled_at, "durationMinutes", status, notes, patient_id, service_id, updated_at)
         VALUES ($1, 0, 'PENDIENTE', 'x', $2, $3, now())`,
        [at(windowStart(), 0), patientId, serviceId],
        '23514',
        'appointments_duration_minutes_positive',
      );
    });
  });

  describe('FOREIGN KEY', () => {
    it('no se crean notificaciones ni citas huerfanas', async () => {
      await expectDbError(
        `INSERT INTO notifications (type, message, user_id) VALUES ('X','m', 999999)`,
        [],
        '23503',
      );
      await expectDbError(
        `INSERT INTO appointments (scheduled_at, "durationMinutes", status, notes, patient_id, service_id, updated_at)
         VALUES ($1, 30, 'PENDIENTE', 'x', 999999, $2, now())`,
        [at(windowStart(), 0), serviceId],
        '23503',
      );
    });
  });

  describe('EXCLUDE de solape de citas (spec 03)', () => {
    it('PENDIENTE y CONFIRMADA solapadas -> 23P01; adyacentes -> permitidas', async () => {
      const t = windowStart();
      await insertAppt(at(t, 0), 'PENDIENTE', 30);
      await expectDbError(
        `INSERT INTO appointments (scheduled_at, "durationMinutes", status, notes, patient_id, service_id, updated_at)
         VALUES ($1, 30, 'CONFIRMADA', 'x', $2, $3, now())`,
        [at(t, 15), patientId, serviceId],
        '23P01',
        'appointments_no_overlap',
      );
      // contenida, envolvente, mismo inicio
      await expectDbError(
        `INSERT INTO appointments (scheduled_at, "durationMinutes", status, notes, patient_id, service_id, updated_at)
         VALUES ($1, 5, 'PENDIENTE', 'x', $2, $3, now())`,
        [at(t, 10), patientId, serviceId],
        '23P01',
      );
      await expectDbError(
        `INSERT INTO appointments (scheduled_at, "durationMinutes", status, notes, patient_id, service_id, updated_at)
         VALUES ($1, 120, 'PENDIENTE', 'x', $2, $3, now())`,
        [at(t, -30), patientId, serviceId],
        '23P01',
      );
      await expectDbError(
        `INSERT INTO appointments (scheduled_at, "durationMinutes", status, notes, patient_id, service_id, updated_at)
         VALUES ($1, 30, 'PENDIENTE', 'x', $2, $3, now())`,
        [at(t, 0), patientId, serviceId],
        '23P01',
      );
      // adyacentes (fin == inicio) antes y despues
      await insertAppt(at(t, 30), 'PENDIENTE', 30);
      await insertAppt(at(t, -30), 'CONFIRMADA', 30);
    });

    it('CANCELADA y COMPLETADA no bloquean; reactivar una cancelada sobre un hueco ocupado falla', async () => {
      const t = windowStart();
      const cancelled = await insertAppt(at(t, 0), 'CANCELADA', 30);
      await insertAppt(at(t, 0), 'COMPLETADA', 30);
      const active = await insertAppt(at(t, 0), 'PENDIENTE', 30); // el hueco esta libre
      await expectDbError(
        `UPDATE appointments SET status = 'CONFIRMADA' WHERE id = $1`,
        [cancelled.rows[0].id],
        '23P01',
        'appointments_no_overlap',
      );
      // cancelar la activa libera el hueco
      await db().query(
        `UPDATE appointments SET status = 'CANCELADA' WHERE id = $1`,
        [active.rows[0].id],
      );
      await db().query(
        `UPDATE appointments SET status = 'CONFIRMADA' WHERE id = $1`,
        [cancelled.rows[0].id],
      );
    });

    it('la agenda es unica: dos pacientes distintos tampoco pueden solapar', async () => {
      const other = await registerPatient(api);
      const t = windowStart();
      await insertAppt(at(t, 0), 'PENDIENTE', 30);
      await expectDbError(
        `INSERT INTO appointments (scheduled_at, "durationMinutes", status, notes, patient_id, service_id, updated_at)
         VALUES ($1, 30, 'PENDIENTE', 'x', $2, $3, now())`,
        [at(t, 10), other.patientId, serviceId],
        '23P01',
      );
    });
  });
});
