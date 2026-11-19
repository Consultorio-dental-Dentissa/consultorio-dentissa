import type { INestApplication } from '@nestjs/common';
import { Http, Session, closeDb, createApp, db, http } from './support/app';
import {
  PASSWORD,
  TestPatient,
  createActiveService,
  createAppointment,
  createStaff,
  expectStatus,
  login,
  loginAdmin,
  makeAgenda,
  registerPatient,
  sleep,
  uniq,
  uniquePhone,
} from './support/factory';

/**
 * Endpoints de edicion: PATCH /users/:id, /services/:id y /appointments/:id.
 */
describe('Endpoints de edicion (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  let admin: Session;
  const agenda = makeAgenda(4);
  let pastSeq = 0;

  beforeAll(async () => {
    app = await createApp();
    api = http(app);
    admin = await loginAdmin(api);
  });

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  const auditRows = async (entity: string, entityId: number, action: string) =>
    (
      await db().query(
        `SELECT before, after FROM audit_logs
         WHERE entity = $1 AND entity_id = $2 AND action = $3 ORDER BY id`,
        [entity, entityId, action],
      )
    ).rows as { before: unknown; after: any }[];

  const revokedCount = async (userId: number) =>
    (
      await db().query(
        `SELECT count(*)::int AS n FROM refresh_tokens
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId],
      )
    ).rows[0].n as number;

  // ---------------------------------------------------------------- USERS
  describe('PATCH /users/:id', () => {
    let staff: { session: Session; userId: number; email: string };
    let other: { session: Session; userId: number; email: string };
    let patient: TestPatient;

    beforeAll(async () => {
      staff = await createStaff(api, admin, 'ASISTENTE');
      other = await createStaff(api, admin, 'ASISTENTE');
      patient = await registerPatient(api);
    });

    it('sin sesion 401; ASISTENTE y PACIENTE 403', async () => {
      const body = { name: 'X' };
      expect(
        (await api.patch(`/users/${other.userId}`, null).send(body)).status,
      ).toBe(401);
      expect(
        (await api.patch(`/users/${other.userId}`, staff.session).send(body))
          .status,
      ).toBe(403);
      expect(
        (await api.patch(`/users/${other.userId}`, patient.session).send(body))
          .status,
      ).toBe(403);
    });

    it('404 si no existe; 400 sin campos o con campos que no se pueden editar', async () => {
      expect(
        (await api.patch('/users/99999999', admin).send({ name: 'X' })).status,
      ).toBe(404);
      const empty = await api.patch(`/users/${other.userId}`, admin).send({});
      expect(empty.status).toBe(400);
      // password y status no se editan aqui: la whitelist los descarta
      const ignored = await api
        .patch(`/users/${other.userId}`, admin)
        .send({ password: 'OtraContrasena-123', status: false });
      expect(ignored.status).toBe(400);
    });

    it('valida telefono, correo, rol y nombre vacio con mensajes en español', async () => {
      const phone = await api
        .patch(`/users/${other.userId}`, admin)
        .send({ phone: '123' });
      expect(phone.status).toBe(400);
      expect(phone.body.message).toBe(
        'El teléfono debe tener entre 10 y 15 dígitos',
      );
      const email = await api
        .patch(`/users/${other.userId}`, admin)
        .send({ email: 'no-es-correo' });
      expect(email.status).toBe(400);
      const role = await api
        .patch(`/users/${other.userId}`, admin)
        .send({ role: 'ROOT' });
      expect(role.status).toBe(400);
      expect(role.body.message).toBe('El rol no es válido');
      const name = await api
        .patch(`/users/${other.userId}`, admin)
        .send({ name: '   ' });
      expect(name.status).toBe(400);
    });

    it('edita datos sin devolver password y normaliza correo/telefono', async () => {
      const newEmail = `${uniq('nuevo')}@example.com`;
      const newPhone = uniquePhone();
      const res = await api.patch(`/users/${other.userId}`, admin).send({
        name: 'Nombre Nuevo',
        lastname: 'Apellido Nuevo',
        email: newEmail.toUpperCase(),
        phone: `(${newPhone.slice(0, 2)}) ${newPhone.slice(2)}`,
      });
      expectStatus(res, 200);
      expect(res.body.data).toMatchObject({
        id: other.userId,
        name: 'Nombre Nuevo',
        lastname: 'Apellido Nuevo',
        email: newEmail,
        phone: newPhone,
      });
      expect(res.body.data.role.role).toBe('ASISTENTE');
      expect(JSON.stringify(res.body)).not.toMatch(/password/i);
      other.email = newEmail;
    });

    it('el cambio de correo revoca las sesiones; el login usa el correo nuevo', async () => {
      other.session = await login(api, other.email, PASSWORD);
      expect(await revokedCount(other.userId)).toBeGreaterThan(0);
      expect((await api.get('/auth/me', other.session)).status).toBe(200);
      const newEmail = `${uniq('otro')}@example.com`;
      expectStatus(
        await api
          .patch(`/users/${other.userId}`, admin)
          .send({ email: newEmail }),
        200,
      );
      const refreshed = await api
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${other.session.refresh}`);
      expect(refreshed.status).toBe(401);
      expect(await revokedCount(other.userId)).toBe(0);
      const oldLogin = await api
        .post('/auth/login')
        .send({ email: other.email, password: PASSWORD });
      expect([400, 401]).toContain(oldLogin.status);
      other.session = await login(api, newEmail, PASSWORD);
      other.email = newEmail;
    });

    it('correo duplicado (sin distinguir mayusculas) y telefono duplicado -> 400', async () => {
      const dupEmail = await api
        .patch(`/users/${other.userId}`, admin)
        .send({ email: staff.email.toUpperCase() });
      expect(dupEmail.status).toBe(400);
      expect(dupEmail.body.message).toBe('Este correo ya esta registrado');

      const dupPhone = await api
        .patch(`/users/${other.userId}`, admin)
        .send({ phone: patient.phone });
      expect(dupPhone.status).toBe(400);
      expect(dupPhone.body.message).toBe('Este telefono ya esta registrado');
    });

    it('sin cambios reales: 200 sin auditoria ni revocacion', async () => {
      const before = await auditRows('USER', other.userId, 'USER_UPDATED');
      const res = await api
        .patch(`/users/${other.userId}`, admin)
        .send({ name: 'Nombre Nuevo', email: other.email.toUpperCase() });
      expectStatus(res, 200);
      expect(
        await auditRows('USER', other.userId, 'USER_UPDATED'),
      ).toHaveLength(before.length);
      expect((await api.get('/auth/me', other.session)).status).toBe(200);
    });

    it('la auditoria USER_UPDATED guarda solo changedFields, sin correo ni telefono', async () => {
      const newEmail = `${uniq('aud')}@example.com`;
      const newPhone = uniquePhone();
      expectStatus(
        await api
          .patch(`/users/${staff.userId}`, admin)
          .send({ email: newEmail, phone: newPhone }),
        200,
      );
      const rows = await auditRows('USER', staff.userId, 'USER_UPDATED');
      expect(rows.length).toBeGreaterThan(0);
      const last = rows[rows.length - 1];
      expect(last.before).toBeNull();
      expect(last.after).toEqual({ changedFields: ['email', 'phone'] });
      expect(JSON.stringify(rows)).not.toContain(newEmail);
      expect(JSON.stringify(rows)).not.toContain(newPhone);
      staff.email = newEmail;
      staff.session = await login(api, newEmail, PASSWORD);
    });

    it('cambia el rol ASISTENTE -> ADMINISTRADOR: revoca refresh y el access token anterior deja de valer', async () => {
      const target = await createStaff(api, admin, 'ASISTENTE');
      // el access token se compara por segundos: se espera a que pase el segundo del login
      await sleep(1100);
      const res = await api
        .patch(`/users/${target.userId}`, admin)
        .send({ role: 'ADMINISTRADOR' });
      expectStatus(res, 200);
      expect(res.body.data.role.role).toBe('ADMINISTRADOR');
      expect(await revokedCount(target.userId)).toBe(0);
      expect((await api.get('/users', target.session)).status).toBe(401);
      // al volver a entrar ya tiene el rol nuevo
      const fresh = await login(api, target.email, PASSWORD);
      expect((await api.get('/users', fresh)).status).toBe(200);
      const rows = await auditRows('USER', target.userId, 'USER_UPDATED');
      expect(rows[rows.length - 1].after).toEqual({ changedFields: ['role'] });
    });

    it('PACIENTE: no cambia de rol ni nadie pasa a PACIENTE (400); su ficha queda intacta', async () => {
      const toStaff = await api
        .patch(`/users/${patient.userId}`, admin)
        .send({ role: 'ASISTENTE' });
      expect(toStaff.status).toBe(400);
      const toPatient = await api
        .patch(`/users/${other.userId}`, admin)
        .send({ role: 'PACIENTE' });
      expect(toPatient.status).toBe(400);

      const before = await db().query(
        'SELECT id, user_id FROM patients WHERE user_id = $1',
        [patient.userId],
      );
      const res = await api
        .patch(`/users/${patient.userId}`, admin)
        .send({ name: 'Paciente Editado', role: 'PACIENTE' });
      expectStatus(res, 200);
      expect(res.body.data.name).toBe('Paciente Editado');
      expect(res.body.data.role.role).toBe('PACIENTE');
      const after = await db().query(
        'SELECT id, user_id FROM patients WHERE user_id = $1',
        [patient.userId],
      );
      expect(after.rows).toEqual(before.rows);
    });

    it('un ADMIN no puede quitarse a si mismo el rol ADMINISTRADOR (403)', async () => {
      const res = await api
        .patch(`/users/${admin.user.id}`, admin)
        .send({ role: 'ASISTENTE' });
      expect(res.status).toBe(403);
      const { rows } = await db().query(
        `SELECT r.role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
        [admin.user.id],
      );
      expect(rows[0].role).toBe('ADMINISTRADOR');
    });

    it('dos ADMIN que se degradan a la vez no pueden dejar el sistema sin administradores', async () => {
      const a = await createStaff(api, admin, 'ADMINISTRADOR');
      const b = await createStaff(api, admin, 'ADMINISTRADOR');
      const { rows: others } = await db().query(
        `SELECT u.id FROM users u JOIN roles r ON r.id = u.role_id
         WHERE r.role = 'ADMINISTRADOR' AND u.status = true AND u.id NOT IN ($1, $2)`,
        [a.userId, b.userId],
      );
      const otherIds = others.map((r: { id: number }) => r.id);

      try {
        // Solo a y b quedan como administradores activos
        if (otherIds.length > 0) {
          await db().query(
            'UPDATE users SET status = false WHERE id = ANY($1::int[])',
            [otherIds],
          );
        }
        const [r1, r2] = await Promise.all([
          api
            .patch(`/users/${b.userId}`, a.session)
            .send({ role: 'ASISTENTE' }),
          api
            .patch(`/users/${a.userId}`, b.session)
            .send({ role: 'ASISTENTE' }),
        ]);
        const statuses = [r1.status, r2.status].sort();
        expect(statuses[0]).toBe(200);
        expect([400, 409]).toContain(statuses[1]);

        const { rows } = await db().query(
          `SELECT count(*)::int AS n FROM users u JOIN roles r ON r.id = u.role_id
           WHERE r.role = 'ADMINISTRADOR' AND u.status = true AND u.id IN ($1, $2)`,
          [a.userId, b.userId],
        );
        expect(rows[0].n).toBe(1);
      } finally {
        if (otherIds.length > 0) {
          await db().query(
            'UPDATE users SET status = true WHERE id = ANY($1::int[])',
            [otherIds],
          );
        }
      }
    });
  });

  // ------------------------------------------- USERS: correo de la propia cuenta
  describe('PATCH /users/:id (correo propio)', () => {
    it('exige y valida current_password solo al cambiar su propio correo', async () => {
      const me = await createStaff(api, admin, 'ADMINISTRADOR');
      const peer = await createStaff(api, admin, 'ASISTENTE');
      const newEmail = `${uniq('propio')}@example.com`;

      const missing = await api
        .patch(`/users/${me.userId}`, me.session)
        .send({ email: newEmail });
      expect(missing.status).toBe(400);
      expect(missing.body.message).toBe('Ingresa tu contraseña actual');

      const wrong = await api
        .patch(`/users/${me.userId}`, me.session)
        .send({ email: newEmail, current_password: 'Incorrecta-123' });
      expect(wrong.status).toBe(400);
      expect(wrong.body.message).toBe('La contraseña actual es incorrecta');
      const unchanged = await db().query(
        'SELECT email FROM users WHERE id = $1',
        [me.userId],
      );
      expect(unchanged.rows[0].email).toBe(me.email);

      // Otros campos de su propia cuenta no piden contraseña
      const name = await api
        .patch(`/users/${me.userId}`, me.session)
        .send({ name: 'Propio' });
      expectStatus(name, 200);

      const ok = await api
        .patch(`/users/${me.userId}`, me.session)
        .send({ email: newEmail, current_password: PASSWORD });
      expectStatus(ok, 200);
      expect(ok.body.data.email).toBe(newEmail);
      expect(JSON.stringify(ok.body)).not.toContain(PASSWORD);
      const rows = await auditRows('USER', me.userId, 'USER_UPDATED');
      expect(JSON.stringify(rows)).not.toContain(PASSWORD);
      expect(JSON.stringify(rows)).not.toContain('current_password');

      // A OTRO usuario no se le pide
      const other = await api
        .patch(`/users/${peer.userId}`, me.session)
        .send({ email: `${uniq('ajeno')}@example.com` });
      expectStatus(other, 200);
    });
  });

  // ------------------------------------------------ PATIENTS: PATCH /patients/:id
  describe('PATCH /patients/:id (status)', () => {
    it('actualiza datos y estado atomicamente, audita y revoca sesiones al desactivar', async () => {
      const patient = await registerPatient(api);
      expect(await revokedCount(patient.userId)).toBeGreaterThan(0);

      const res = await api
        .patch(`/patients/${patient.patientId}`, admin)
        .send({ address: 'Calle Nueva 99', status: false });
      expectStatus(res, 200);

      const { rows } = await db().query(
        'SELECT status FROM users WHERE id = $1',
        [patient.userId],
      );
      expect(rows[0].status).toBe(false);
      expect(await revokedCount(patient.userId)).toBe(0);

      const statusAudit = await auditRows(
        'USER',
        patient.userId,
        'USER_STATUS_CHANGED',
      );
      expect(statusAudit).toHaveLength(1);
      expect(statusAudit[0].after).toEqual({ status: false });
      const patientAudit = await auditRows(
        'PATIENT',
        patient.patientId,
        'PATIENT_UPDATED',
      );
      expect(patientAudit[0].after.changedFields).toEqual(
        expect.arrayContaining(['status', 'address']),
      );

      const loginRes = await api
        .post('/auth/login')
        .send({ email: patient.email, password: patient.password });
      expect(loginRes.status).toBeGreaterThanOrEqual(400);

      // Solo status es valido; reactivar
      const back = await api
        .patch(`/patients/${patient.patientId}`, admin)
        .send({ status: true });
      expectStatus(back, 200);
      const again = await db().query('SELECT status FROM users WHERE id = $1', [
        patient.userId,
      ]);
      expect(again.rows[0].status).toBe(true);
    });

    it('status no booleano => 400 y sin cambios; ASISTENTE 403', async () => {
      const patient = await registerPatient(api);
      const staff = await createStaff(api, admin, 'ASISTENTE');
      const bad = await api
        .patch(`/patients/${patient.patientId}`, admin)
        .send({ status: 'no' });
      expect(bad.status).toBe(400);
      const denied = await api
        .patch(`/patients/${patient.patientId}`, staff.session)
        .send({ status: false });
      expect(denied.status).toBe(403);
      const { rows } = await db().query(
        'SELECT status FROM users WHERE id = $1',
        [patient.userId],
      );
      expect(rows[0].status).toBe(true);
    });
  });

  // ------------------------------------------------------------- SERVICES
  describe('PATCH /services/:id', () => {
    let staff: { session: Session };
    let patient: TestPatient;
    let svc: { id: number; name: string };
    let svc2: { id: number; name: string };

    beforeAll(async () => {
      staff = await createStaff(api, admin, 'ASISTENTE');
      patient = await registerPatient(api);
      svc = await createActiveService(api, admin);
      svc2 = await createActiveService(api, admin);
    });

    it('sin sesion 401; ASISTENTE y PACIENTE 403; inexistente 404', async () => {
      const body = { price: 10 };
      expect(
        (await api.patch(`/services/${svc.id}`, null).send(body)).status,
      ).toBe(401);
      expect(
        (await api.patch(`/services/${svc.id}`, staff.session).send(body))
          .status,
      ).toBe(403);
      expect(
        (await api.patch(`/services/${svc.id}`, patient.session).send(body))
          .status,
      ).toBe(403);
      expect(
        (await api.patch('/services/99999999', admin).send(body)).status,
      ).toBe(404);
    });

    it('validaciones: vacio, precio negativo, duracion fuera de 15-120', async () => {
      expect(
        (await api.patch(`/services/${svc.id}`, admin).send({})).status,
      ).toBe(400);
      // status no se edita aqui: se descarta y queda sin campos
      expect(
        (await api.patch(`/services/${svc.id}`, admin).send({ status: false }))
          .status,
      ).toBe(400);
      const price = await api
        .patch(`/services/${svc.id}`, admin)
        .send({ price: -1 });
      expect(price.status).toBe(400);
      expect(price.body.message).toBe(
        'El precio no puede ser un número negativo',
      );
      for (const durationMinutes of [10, 121]) {
        const dur = await api
          .patch(`/services/${svc.id}`, admin)
          .send({ durationMinutes });
        expect(dur.status).toBe(400);
        expect(dur.body.message).toContain('15 minutos');
      }
    });

    it('nombre duplicado -> 400 (sin distinguir mayusculas)', async () => {
      const res = await api
        .patch(`/services/${svc.id}`, admin)
        .send({ name: svc2.name.toUpperCase() });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Ya existe un servicio con este nombre');
    });

    it('edita campos, no cambia status ni imagenes, y audita changedFields', async () => {
      const name = uniq('Renombrado ');
      const res = await api.patch(`/services/${svc.id}`, admin).send({
        name,
        description: 'Descripcion nueva',
        price: 250.5,
        durationMinutes: 45,
        status: false,
      });
      expectStatus(res, 200);
      expect(res.body.data).toMatchObject({
        id: svc.id,
        name,
        description: 'Descripcion nueva',
        durationMinutes: 45,
        status: true,
      });
      expect(Number(res.body.data.price)).toBe(250.5);
      expect(res.body.data.images).toHaveLength(1);

      const rows = await auditRows('SERVICE', svc.id, 'SERVICE_UPDATED');
      expect(rows[rows.length - 1].after).toEqual({
        changedFields: ['name', 'description', 'price', 'durationMinutes'],
      });
    });

    it('sin cambios reales: sin auditoria nueva', async () => {
      const before = await auditRows('SERVICE', svc.id, 'SERVICE_UPDATED');
      expectStatus(
        await api
          .patch(`/services/${svc.id}`, admin)
          .send({ durationMinutes: 45 }),
        200,
      );
      expect(
        await auditRows('SERVICE', svc.id, 'SERVICE_UPDATED'),
      ).toHaveLength(before.length);
    });

    it('cambiar la duracion no modifica las citas ya creadas', async () => {
      const at = agenda.next();
      const created = await createAppointment(api, patient.session, {
        serviceId: svc2.id,
        at,
      });
      expectStatus(created, 201);
      const apptId = created.body.data.id as number;
      expect(created.body.data.durationMinutes).toBe(30);

      expectStatus(
        await api
          .patch(`/services/${svc2.id}`, admin)
          .send({ durationMinutes: 90 }),
        200,
      );
      const { rows } = await db().query(
        'SELECT "durationMinutes" AS d FROM appointments WHERE id = $1',
        [apptId],
      );
      expect(rows[0].d).toBe(30);
    });
  });

  // --------------------------------------------------------- APPOINTMENTS
  describe('PATCH /appointments/:id', () => {
    let staff: { session: Session };
    let patient: TestPatient;
    let other: TestPatient;
    let s30: { id: number };
    let s45: { id: number };
    let s60: { id: number };
    const SECRET = 'NOTA-SECRETA-EDICION-123';

    const forcePast = async (id: number) => {
      pastSeq += 1;
      const past = new Date(Date.UTC(2021, 0, 1) + pastSeq * 3 * 3600_000);
      await db().query(
        'UPDATE appointments SET scheduled_at = $1 WHERE id = $2',
        [past.toISOString(), id],
      );
    };

    const newAppt = async (
      who: TestPatient = patient,
      at: Date = agenda.next(),
      serviceId = s30.id,
    ) => {
      const res = await createAppointment(api, who.session, { serviceId, at });
      expectStatus(res, 201);
      return res.body.data.id as number;
    };

    beforeAll(async () => {
      staff = await createStaff(api, admin, 'ASISTENTE');
      patient = await registerPatient(api);
      other = await registerPatient(api);
      s30 = await createActiveService(api, admin, 30);
      s45 = await createActiveService(api, admin, 45);
      s60 = await createActiveService(api, admin, 60);
    });

    it('sin sesion 401; inexistente 404; sin campos 400 (la fecha no se edita aqui)', async () => {
      const id = await newAppt();
      expect(
        (await api.patch(`/appointments/${id}`, null).send({ notes: 'a' }))
          .status,
      ).toBe(401);
      expect(
        (await api.patch('/appointments/99999999', admin).send({ notes: 'a' }))
          .status,
      ).toBe(404);
      expect(
        (await api.patch(`/appointments/${id}`, admin).send({})).status,
      ).toBe(400);
      const date = await api
        .patch(`/appointments/${id}`, admin)
        .send({ scheduled_at: new Date(Date.now() + 5e9).toISOString() });
      expect(date.status).toBe(400);
    });

    it('validaciones de notas y service_id', async () => {
      const id = await newAppt();
      const long = await api
        .patch(`/appointments/${id}`, admin)
        .send({ notes: 'a'.repeat(301) });
      expect(long.status).toBe(400);
      expect(
        (await api.patch(`/appointments/${id}`, admin).send({ notes: '  ' }))
          .status,
      ).toBe(400);
      expect(
        (
          await api
            .patch(`/appointments/${id}`, admin)
            .send({ service_id: 'x' })
        ).status,
      ).toBe(400);
    });

    it('ADMIN y ASISTENTE editan una cita PENDIENTE y CONFIRMADA; responde el detalle', async () => {
      const id = await newAppt();
      const a = await api
        .patch(`/appointments/${id}`, staff.session)
        .send({ notes: 'por asistente' });
      expectStatus(a, 200);
      expect(a.body.data).toMatchObject({
        id,
        notes: 'por asistente',
        status: 'PENDIENTE',
        consultation_id: null,
      });
      expect(a.body.data.service.id).toBe(s30.id);
      expectStatus(await api.patch(`/appointments/${id}/confirm`, admin), 200);
      const b = await api
        .patch(`/appointments/${id}`, admin)
        .send({ notes: 'por admin' });
      expectStatus(b, 200);
      expect(b.body.data.status).toBe('CONFIRMADA');
      expect(b.body.data.notes).toBe('por admin');
    });

    it('PACIENTE edita la suya PENDIENTE; la ajena 404; CONFIRMADA 403', async () => {
      const id = await newAppt();
      const own = await api
        .patch(`/appointments/${id}`, patient.session)
        .send({ notes: 'mi nota' });
      expectStatus(own, 200);
      expect(own.body.data.notes).toBe('mi nota');

      expect(
        (
          await api
            .patch(`/appointments/${id}`, other.session)
            .send({ notes: 'intruso' })
        ).status,
      ).toBe(404);

      expectStatus(await api.patch(`/appointments/${id}/confirm`, admin), 200);
      expect(
        (
          await api
            .patch(`/appointments/${id}`, patient.session)
            .send({ notes: 'ya confirmada' })
        ).status,
      ).toBe(403);
    });

    it('PACIENTE no edita una cita cuya fecha ya paso (409); el staff si', async () => {
      const id = await newAppt();
      await forcePast(id);
      expect(
        (
          await api
            .patch(`/appointments/${id}`, patient.session)
            .send({ notes: 'tarde' })
        ).status,
      ).toBe(409);
      expectStatus(
        await api
          .patch(`/appointments/${id}`, staff.session)
          .send({ notes: 'staff' }),
        200,
      );
    });

    it('COMPLETADA y CANCELADA -> 409 para todos los roles', async () => {
      const done = await newAppt();
      expectStatus(
        await api.patch(`/appointments/${done}/confirm`, admin),
        200,
      );
      await forcePast(done);
      expectStatus(
        await api.patch(`/appointments/${done}/complete`, admin),
        200,
      );

      const cancelled = await newAppt();
      expectStatus(
        await api
          .patch(`/appointments/${cancelled}/cancel`, admin)
          .send({ reason: 'prueba' }),
        200,
      );

      for (const id of [done, cancelled]) {
        for (const who of [admin, staff.session, patient.session]) {
          const res = await api
            .patch(`/appointments/${id}`, who)
            .send({ notes: 'no debe cambiar' });
          expect(res.status).toBe(409);
        }
      }
    });

    it('cambiar de servicio actualiza la duracion; solape con otra cita -> 409; consecutivas permitidas', async () => {
      const start = agenda.next();
      const x = await newAppt(patient, start, s30.id); // 0-30
      const y = await newAppt(
        other,
        new Date(start.getTime() + 45 * 60_000),
        s30.id,
      ); // 45-75

      // 60 min: 0-60 choca con y (45-75)
      const overlap = await api
        .patch(`/appointments/${x}`, admin)
        .send({ service_id: s60.id });
      expect(overlap.status).toBe(409);
      const dur = await db().query(
        'SELECT "durationMinutes" AS d, service_id FROM appointments WHERE id = $1',
        [x],
      );
      expect(dur.rows[0]).toEqual({ d: 30, service_id: s30.id });

      // 45 min: 0-45 termina justo cuando empieza y (estricto): permitido
      const ok = await api
        .patch(`/appointments/${x}`, staff.session)
        .send({ service_id: s45.id, notes: 'cambio de servicio' });
      expectStatus(ok, 200);
      expect(ok.body.data.durationMinutes).toBe(45);
      expect(ok.body.data.service.id).toBe(s45.id);

      // y mantiene su duracion original
      const yRow = await db().query(
        'SELECT "durationMinutes" AS d FROM appointments WHERE id = $1',
        [y],
      );
      expect(yRow.rows[0].d).toBe(30);

      // la propia cita no cuenta como solape consigo misma: volver a 30 min
      expectStatus(
        await api
          .patch(`/appointments/${x}`, admin)
          .send({ service_id: s30.id }),
        200,
      );
    });

    it('servicio inexistente 404; inactivo 400', async () => {
      const id = await newAppt();
      expect(
        (
          await api
            .patch(`/appointments/${id}`, admin)
            .send({ service_id: 99999999 })
        ).status,
      ).toBe(404);
      const inactive = await createActiveService(api, admin, 30);
      expectStatus(
        await api
          .patch(`/services/status/${inactive.id}`, admin)
          .send({ status: false }),
        200,
      );
      expect(
        (
          await api
            .patch(`/appointments/${id}`, admin)
            .send({ service_id: inactive.id })
        ).status,
      ).toBe(400);
    });

    it('notifica al otro lado con texto generico y audita sin el contenido de las notas', async () => {
      const id = await newAppt();
      const { rows: pat } = await db().query(
        'SELECT user_id FROM patients WHERE id = $1',
        [patient.patientId],
      );

      // staff edita -> avisa al paciente
      expectStatus(
        await api
          .patch(`/appointments/${id}`, staff.session)
          .send({ notes: SECRET }),
        200,
      );
      // paciente edita -> avisa a los administradores
      expectStatus(
        await api
          .patch(`/appointments/${id}`, patient.session)
          .send({ notes: `${SECRET} v2`, service_id: s45.id }),
        200,
      );

      const { rows: notifs } = await db().query(
        `SELECT user_id, type, message FROM notifications
         WHERE appointment_id = $1 AND type = 'CITA_ACTUALIZADA' ORDER BY id`,
        [id],
      );
      expect(notifs.length).toBeGreaterThanOrEqual(2);
      expect(notifs[0].user_id).toBe(pat[0].user_id);
      expect(notifs.some((n: any) => n.user_id === admin.user.id)).toBe(true);
      expect(JSON.stringify(notifs)).not.toContain(SECRET);

      const rows = await auditRows('APPOINTMENT', id, 'APPOINTMENT_UPDATED');
      expect(rows.map((r) => r.after)).toEqual([
        { changedFields: ['notes'] },
        { changedFields: ['notes', 'service_id'] },
      ]);
      expect(JSON.stringify(rows)).not.toContain(SECRET);
    });

    it('sin cambios reales: sin notificacion ni auditoria', async () => {
      const id = await newAppt();
      const res = await api
        .patch(`/appointments/${id}`, admin)
        .send({ service_id: s30.id, notes: 'nota de prueba' });
      expectStatus(res, 200);
      expect(
        await auditRows('APPOINTMENT', id, 'APPOINTMENT_UPDATED'),
      ).toHaveLength(0);
      const { rows } = await db().query(
        `SELECT 1 FROM notifications WHERE appointment_id = $1 AND type = 'CITA_ACTUALIZADA'`,
        [id],
      );
      expect(rows).toHaveLength(0);
    });
  });
});
