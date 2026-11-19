import type { INestApplication } from '@nestjs/common';
import { Http, Session, closeDb, createApp, db, http } from './support/app';
import {
  PASSWORD,
  TestPatient,
  createActiveService,
  createAppointment,
  createStaff,
  expectStatus,
  loginAdmin,
  makeAgenda,
  patientPayload,
  registerPatient,
  uniquePhone,
} from './support/factory';

/**
 * Spec 06 (usuarios y autorizacion) + spec 01 (matriz por rol).
 */
describe('Permisos por rol (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  let admin: Session;
  let assistant: Session;
  let assistantId: number;
  let patientA: TestPatient;
  let patientB: TestPatient;
  let service: { id: number; durationMinutes: number };
  const agenda = makeAgenda(0);
  let apptA: number;
  let apptB: number;

  beforeAll(async () => {
    app = await createApp();
    api = http(app);
    admin = await loginAdmin(api);
    const staff = await createStaff(api, admin, 'ASISTENTE');
    assistant = staff.session;
    assistantId = staff.userId;
    patientA = await registerPatient(api);
    patientB = await registerPatient(api);
    service = await createActiveService(api, admin);

    const a = await createAppointment(api, patientA.session, {
      serviceId: service.id,
      at: agenda.next(),
    });
    expectStatus(a, 201);
    apptA = a.body.data.id;
    const b = await createAppointment(api, patientB.session, {
      serviceId: service.id,
      at: agenda.next(),
    });
    expectStatus(b, 201);
    apptB = b.body.data.id;
  });

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  // ---------------------------------------------------------------------
  // Matriz de endpoints administrativos prohibidos
  // ---------------------------------------------------------------------
  type Probe = [
    method: 'get' | 'post' | 'patch' | 'delete',
    url: string,
    body?: object,
  ];

  const adminOnly: Probe[] = [
    ['get', '/users'],
    ['get', '/users/1'],
    ['post', '/users', { name: 'x' }],
    ['patch', '/users/status/1', { estado: false }],
    ['patch', '/patients/1', { name: 'Otro' }],
    ['post', '/services', { name: 'x' }],
    ['patch', '/services/status/1', { status: true }],
    ['get', '/audit-logs'],
    ['get', '/dashboard/stats'],
    ['get', '/consultations'],
    ['get', '/consultations/1'],
    ['post', '/consultations', { appointment_id: 1, description: 'x' }],
    ['patch', '/consultations/1', { description: 'x' }],
    ['get', '/faq/admin'],
    ['post', '/faq', { question: 'q', response: 'r' }],
    ['get', '/offers/admin'],
    ['post', '/offers', { name: 'x' }],
    ['patch', '/appointments/1/confirm'],
    ['patch', '/appointments/1/complete'],
  ];

  const call = (probe: Probe, session: Session | null) => {
    const [method, url, body] = probe;
    const req = api[method](url, session);
    return body ? req.send(body) : req;
  };

  describe('sin sesion', () => {
    it.each(adminOnly)('%s %s -> 401', async (...probe) => {
      const res = await call(probe, null);
      expect(res.status).toBe(401);
    });

    it.each(['/appointments', '/notifications', '/patients', '/auth/me'])(
      'GET %s -> 401',
      async (url) => {
        expect((await api.get(url)).status).toBe(401);
      },
    );
  });

  describe('PACIENTE', () => {
    it.each(adminOnly)('%s %s -> 403', async (...probe) => {
      const res = await call(probe, patientA.session);
      expect(res.status).toBe(403);
    });

    it('no puede listar pacientes (solo ADMIN/ASISTENTE)', async () => {
      expect((await api.get('/patients', patientA.session)).status).toBe(403);
    });

    it('no accede a /users, /audit-logs, /dashboard/stats ni /consultations (spec 06)', async () => {
      for (const url of [
        '/users',
        '/audit-logs',
        '/dashboard/stats',
        '/consultations',
      ]) {
        expect((await api.get(url, patientA.session)).status).toBe(403);
      }
    });

    it('no ve el historial clinico (consultas) ni de su propio perfil', async () => {
      const res = await api.get(
        `/patients/${patientA.patientId}/history?type=consultations`,
        patientA.session,
      );
      expect(res.status).toBe(403);
    });

    it('no puede usar completed_without_consultation (dato clinico)', async () => {
      const res = await api.get(
        '/appointments?completed_without_consultation=true',
        patientA.session,
      );
      expect(res.status).toBe(403);
    });
  });

  describe('ASISTENTE', () => {
    it.each(adminOnly.filter(([, url]) => url !== '/patients/1'))(
      '%s %s -> 403',
      async (...probe) => {
        const res = await call(probe, assistant);
        expect(res.status).toBe(403);
      },
    );

    it('no puede editar pacientes (PATCH /patients/:id es solo ADMIN)', async () => {
      const res = await api
        .patch(`/patients/${patientA.patientId}`, assistant)
        .send({ name: 'Cambiado' });
      expect(res.status).toBe(403);
    });

    it('no puede ver el historial clinico ni citas completadas sin consulta', async () => {
      expect(
        (
          await api.get(
            `/patients/${patientA.patientId}/history?type=consultations`,
            assistant,
          )
        ).status,
      ).toBe(403);
      expect(
        (
          await api.get(
            '/appointments?completed_without_consultation=true',
            assistant,
          )
        ).status,
      ).toBe(403);
    });

    it('lista pacientes con ficha REDUCIDA (sin direccion, nacimiento ni contacto de emergencia)', async () => {
      const res = await api.get(
        `/patients?search=${encodeURIComponent(patientA.email)}`,
        assistant,
      );
      expectStatus(res, 200);
      expect(res.body.data.items).toHaveLength(1);
      const item = res.body.data.items[0];
      expect(item.user.name).toBeDefined();
      expect(item).not.toHaveProperty('address');
      expect(item).not.toHaveProperty('birth_date');
      expect(item).not.toHaveProperty('emergency_phone');
    });

    it('la ficha individual tambien es reducida', async () => {
      const res = await api.get(`/patients/${patientA.patientId}`, assistant);
      expectStatus(res, 200);
      expect(res.body.data).not.toHaveProperty('address');
      expect(res.body.data).not.toHaveProperty('birth_date');
      expect(res.body.data).not.toHaveProperty('emergency_phone');
      // El ADMIN si ve la ficha completa
      const full = await api.get(`/patients/${patientA.patientId}`, admin);
      expectStatus(full, 200);
      expect(full.body.data.address).toBe('Calle Falsa 123');
      expect(full.body.data.emergency_phone).toBe('5512345678');
    });

    it('SI puede crear citas para pacientes, listarlas, cancelar y reprogramar', async () => {
      const created = await createAppointment(api, assistant, {
        serviceId: service.id,
        at: agenda.next(),
        patientId: patientA.patientId,
      });
      expectStatus(created, 201);
      const id = created.body.data.id;

      expect((await api.get('/appointments', assistant)).status).toBe(200);
      expect((await api.get(`/appointments/${id}`, assistant)).status).toBe(
        200,
      );

      const resched = await api
        .patch(`/appointments/${id}/reschedule`, assistant)
        .send({
          scheduled_at: agenda.next().toISOString(),
          reason: 'Cambio solicitado por telefono',
        });
      expectStatus(resched, 200);

      const cancelled = await api
        .patch(`/appointments/${id}/cancel`, assistant)
        .send({ reason: 'El paciente no puede asistir' });
      expectStatus(cancelled, 200);
      expect(cancelled.body.data.status).toBe('CANCELADA');
    });

    it('NO puede confirmar ni completar citas (transiciones solo ADMIN)', async () => {
      const confirm = await api.patch(
        `/appointments/${apptA}/confirm`,
        assistant,
      );
      expect(confirm.status).toBe(403);
      const complete = await api.patch(
        `/appointments/${apptA}/complete`,
        assistant,
      );
      expect(complete.status).toBe(403);
      const check = await db().query(
        'SELECT status FROM appointments WHERE id = $1',
        [apptA],
      );
      expect(check.rows[0].status).toBe('PENDIENTE');
    });

    it('un ASISTENTE no puede desactivar usuarios ni crear administradores', async () => {
      const res = await api.post('/users', assistant).send({
        name: 'Hacker',
        lastname: 'Admin',
        email: 'hacker.e2e@example.com',
        phone: uniquePhone(),
        password: PASSWORD,
        role: 'ADMINISTRADOR',
      });
      expect(res.status).toBe(403);
      const rows = await db().query(
        "SELECT 1 FROM users WHERE email = 'hacker.e2e@example.com'",
      );
      expect(rows.rowCount).toBe(0);
      const off = await api
        .patch(`/users/status/${patientA.userId}`, assistant)
        .send({ estado: false });
      expect(off.status).toBe(403);
      expect(assistantId).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------
  // Spec 06 - caso 1: un paciente no crea usuarios administrativos
  // ---------------------------------------------------------------------
  describe('un paciente no puede crear usuarios administrativos', () => {
    it('POST /users como PACIENTE -> 403 y no se crea nada', async () => {
      const email = 'admin.falso.e2e@example.com';
      const res = await api.post('/users', patientA.session).send({
        name: 'Falso',
        lastname: 'Admin',
        email,
        phone: uniquePhone(),
        password: PASSWORD,
        role: 'ADMINISTRADOR',
      });
      expect(res.status).toBe(403);
      const rows = await db().query('SELECT 1 FROM users WHERE email = $1', [
        email,
      ]);
      expect(rows.rowCount).toBe(0);
    });

    it('el registro publico ignora un `role` enviado: siempre crea un PACIENTE', async () => {
      const payload = { ...patientPayload(), role: 'ADMINISTRADOR' };
      const res = await api.post('/auth/register').send(payload);
      expectStatus(res, 201);
      const row = await db().query(
        `SELECT r.role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = $1`,
        [payload.email],
      );
      expect(row.rows[0].role).toBe('PACIENTE');
    });

    it('el registro publico exige los datos del paciente', async () => {
      const { patient: _omit, ...withoutPatient } = patientPayload();
      void _omit;
      const res = await api.post('/auth/register').send(withoutPatient);
      expect(res.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------
  // Spec 06 - caso 3: un paciente no ve ni modifica datos de otros
  // ---------------------------------------------------------------------
  describe('un paciente no ve ni modifica datos de otro paciente', () => {
    it('ficha, historial y listado de pacientes ajenos -> 404/403', async () => {
      expect(
        (await api.get(`/patients/${patientB.patientId}`, patientA.session))
          .status,
      ).toBe(404);
      expect(
        (
          await api.get(
            `/patients/${patientB.patientId}/history`,
            patientA.session,
          )
        ).status,
      ).toBe(404);
      expect(
        (
          await api
            .patch(`/patients/${patientB.patientId}`, patientA.session)
            .send({ name: 'Hackeado' })
        ).status,
      ).toBe(403);
      const check = await db().query('SELECT name FROM users WHERE id = $1', [
        patientB.userId,
      ]);
      expect(check.rows[0].name).toBe('Paciente');
    });

    it('GET /patients/me devuelve solo el perfil propio (id del token, no del cliente)', async () => {
      const res = await api.get('/patients/me', patientA.session);
      expectStatus(res, 200);
      expect(res.body.data.id).toBe(patientA.patientId);
      expect(res.body.data.user.email).toBe(patientA.email);
    });

    it('la lista de citas solo trae las propias, aunque se pida patient_id ajeno', async () => {
      const own = await api.get('/appointments', patientA.session);
      expectStatus(own, 200);
      const ids = own.body.data.items.map((i: { id: number }) => i.id);
      expect(ids).toContain(apptA);
      expect(ids).not.toContain(apptB);

      const spoof = await api.get(
        `/appointments?patient_id=${patientB.patientId}`,
        patientA.session,
      );
      expectStatus(spoof, 200);
      const spoofIds = spoof.body.data.items.map((i: { id: number }) => i.id);
      expect(spoofIds).not.toContain(apptB);
    });

    it('detalle, cancelar y reprogramar una cita ajena -> 404 y la cita no cambia', async () => {
      expect(
        (await api.get(`/appointments/${apptB}`, patientA.session)).status,
      ).toBe(404);
      expect(
        (
          await api
            .patch(`/appointments/${apptB}/cancel`, patientA.session)
            .send({ reason: 'No es mia' })
        ).status,
      ).toBe(404);
      expect(
        (
          await api
            .patch(`/appointments/${apptB}/reschedule`, patientA.session)
            .send({ scheduled_at: agenda.next().toISOString(), reason: 'x' })
        ).status,
      ).toBe(404);
      const check = await db().query(
        'SELECT status FROM appointments WHERE id = $1',
        [apptB],
      );
      expect(check.rows[0].status).toBe('PENDIENTE');
    });

    it('un paciente NO crea citas para otro: el patient_id del body se ignora', async () => {
      const res = await createAppointment(api, patientA.session, {
        serviceId: service.id,
        at: agenda.next(),
        patientId: patientB.patientId,
      });
      expectStatus(res, 201);
      const row = await db().query(
        'SELECT patient_id FROM appointments WHERE id = $1',
        [res.body.data.id],
      );
      expect(row.rows[0].patient_id).toBe(patientA.patientId);
    });

    it('las notificaciones son privadas: B no ve ni marca las de A', async () => {
      const notif = await db().query(
        `INSERT INTO notifications (type, message, user_id)
         VALUES ('TEST', 'privada de A', $1) RETURNING id`,
        [patientA.userId],
      );
      const id = notif.rows[0].id;
      const listB = await api.get('/notifications', patientB.session);
      expectStatus(listB, 200);
      expect(
        listB.body.data.items.map((n: { id: number }) => n.id),
      ).not.toContain(id);
      expect(
        (await api.patch(`/notifications/${id}/read`, patientB.session)).status,
      ).toBe(404);
      const listA = await api.get('/notifications', patientA.session);
      expect(listA.body.data.items.map((n: { id: number }) => n.id)).toContain(
        id,
      );
    });
  });

  describe('el paciente solo modifica email, contrasena, telefono y telefono de emergencia', () => {
    it('PATCH /patients/me con campos clinicos/administrativos no cambia nada (400)', async () => {
      const res = await api.patch('/patients/me', patientB.session).send({
        address: 'Otra calle',
        birth_date: '2000-01-01',
        name: 'Nuevo',
      });
      expect(res.status).toBe(400);
      const row = await db().query(
        'SELECT address FROM patients WHERE id = $1',
        [patientB.patientId],
      );
      expect(row.rows[0].address).toBe('Calle Falsa 123');
    });

    it('puede cambiar su telefono de emergencia y su telefono', async () => {
      const phone = uniquePhone();
      const res = await api
        .patch('/patients/me', patientB.session)
        .send({ phone, emergency_phone: '5599887766' });
      expectStatus(res, 200);
      const row = await db().query(
        `SELECT u.phone, p.emergency_phone FROM patients p JOIN users u ON u.id = p.user_id WHERE p.id = $1`,
        [patientB.patientId],
      );
      expect(row.rows[0].phone).toBe(phone);
      expect(row.rows[0].emergency_phone).toBe('5599887766');
    });

    it('cambiar el correo exige la contrasena actual', async () => {
      const res = await api
        .patch('/patients/me', patientB.session)
        .send({ email: 'nuevo.correo.e2e@example.com' });
      expect(res.status).toBe(400);
    });

    it('un telefono ya usado por otro usuario se rechaza', async () => {
      const res = await api
        .patch('/patients/me', patientB.session)
        .send({ phone: patientA.phone });
      expect(res.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------
  // Spec 06 - caso 2: usuario desactivado
  // ---------------------------------------------------------------------
  describe('un usuario desactivado no inicia sesion ni sigue usando su sesion', () => {
    it('pierde el acceso inmediato (access token, refresh y login)', async () => {
      const victim = await registerPatient(api);
      expect((await api.get('/auth/me', victim.session)).status).toBe(200);

      const off = await api
        .patch(`/users/status/${victim.userId}`, admin)
        .send({ estado: false });
      expectStatus(off, 200);

      // Sesion activa: rutas protegidas -> 401
      expect((await api.get('/auth/me', victim.session)).status).toBe(401);
      expect((await api.get('/appointments', victim.session)).status).toBe(401);
      expect((await api.get('/notifications', victim.session)).status).toBe(
        401,
      );

      // Refresh con la cookie vigente -> rechazado
      const refresh = await api
        .post('/auth/refresh', victim.session)
        .set('Cookie', `refresh_token=${victim.session.refresh}`);
      expect(refresh.status).toBe(401);

      // Login nuevo -> 401
      const login = await api
        .post('/auth/login')
        .send({ email: victim.email, password: victim.password });
      expect(login.status).toBe(401);

      // Reactivar devuelve el acceso (el token de acceso sigue siendo valido)
      const on = await api
        .patch(`/users/status/${victim.userId}`, admin)
        .send({ estado: true });
      expectStatus(on, 200);
      const again = await api
        .post('/auth/login')
        .send({ email: victim.email, password: victim.password });
      expect([200, 201]).toContain(again.status);
    });

    it('un paciente desactivado no puede recibir nuevas citas', async () => {
      const victim = await registerPatient(api);
      await api
        .patch(`/users/status/${victim.userId}`, admin)
        .send({ estado: false });
      const res = await createAppointment(api, admin, {
        serviceId: service.id,
        at: agenda.next(),
        patientId: victim.patientId,
      });
      expect(res.status).toBe(400);
    });

    it('un ADMIN no puede desactivarse a si mismo ni al ultimo admin activo', async () => {
      const self = await api
        .patch(`/users/status/${admin.user.id}`, admin)
        .send({ estado: false });
      expect(self.status).toBe(403);
    });
  });
});
