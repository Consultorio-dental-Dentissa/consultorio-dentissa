import type { INestApplication } from '@nestjs/common';
import { Http, Session, closeDb, createApp, db, http } from './support/app';
import {
  TestPatient,
  createActiveService,
  createAppointment,
  createStaff,
  expectStatus,
  loginAdmin,
  makeAgenda,
  registerPatient,
} from './support/factory';

/**
 * Spec 03 (estados) + spec 04 (notificaciones): ciclo de vida de la cita,
 * transiciones invalidas, reglas por fecha, permisos y notificaciones.
 */
describe('Citas: ciclo de estados y notificaciones (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  let admin: Session;
  let assistant: Session;
  let patient: TestPatient;
  let other: TestPatient;
  let service: { id: number };
  const agenda = makeAgenda(2);
  let pastSeq = 0;

  /** Fuerza una fecha pasada (UPDATE directo) sin solapar con otras citas. */
  const forcePast = async (id: number) => {
    pastSeq += 1;
    const past = new Date(Date.UTC(2020, 0, 1) + pastSeq * 3 * 3600_000);
    await db().query(
      'UPDATE appointments SET scheduled_at = $1 WHERE id = $2',
      [past.toISOString(), id],
    );
  };

  const status = async (id: number) =>
    (await db().query('SELECT status FROM appointments WHERE id = $1', [id]))
      .rows[0].status as string;

  const notificationsOf = async (userId: number, apptId: number) =>
    (
      await db().query(
        `SELECT type, message, is_read FROM notifications
         WHERE user_id = $1 AND appointment_id = $2 ORDER BY id`,
        [userId, apptId],
      )
    ).rows as { type: string; message: string; is_read: boolean }[];

  const countRows = async (table: string) =>
    (await db().query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0]
      .n as number;

  const newPending = async (who: TestPatient = patient) => {
    const res = await createAppointment(api, who.session, {
      serviceId: service.id,
      at: agenda.next(),
    });
    expectStatus(res, 201);
    return res.body.data.id as number;
  };

  const newConfirmed = async (who: TestPatient = patient) => {
    const id = await newPending(who);
    expectStatus(await api.patch(`/appointments/${id}/confirm`, admin), 200);
    return id;
  };

  /** Cita COMPLETADA: confirmar, mover al pasado y completar. */
  const newCompleted = async (who: TestPatient = patient) => {
    const id = await newConfirmed(who);
    await forcePast(id);
    expectStatus(await api.patch(`/appointments/${id}/complete`, admin), 200);
    return id;
  };

  beforeAll(async () => {
    app = await createApp();
    api = http(app);
    admin = await loginAdmin(api);
    assistant = (await createStaff(api, admin, 'ASISTENTE')).session;
    patient = await registerPatient(api);
    other = await registerPatient(api);
    service = await createActiveService(api, admin, 30);
  }, 120000);

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  describe('ciclo completo PENDIENTE -> CONFIRMADA -> COMPLETADA', () => {
    it('sigue el flujo, notifica al paciente y audita cada paso', async () => {
      const id = await newPending();
      expect(await status(id)).toBe('PENDIENTE');

      const confirm = await api.patch(`/appointments/${id}/confirm`, admin);
      expectStatus(confirm, 200);
      expect(confirm.body.data.status).toBe('CONFIRMADA');
      expect(await status(id)).toBe('CONFIRMADA');

      await forcePast(id);
      const complete = await api.patch(`/appointments/${id}/complete`, admin);
      expectStatus(complete, 200);
      expect(complete.body.data.status).toBe('COMPLETADA');

      const detail = await api.get(`/appointments/${id}`, patient.session);
      expectStatus(detail, 200);
      expect(detail.body.data.status).toBe('COMPLETADA');

      const notifications = await notificationsOf(patient.userId, id);
      expect(notifications.map((n) => n.type)).toEqual([
        'CITA_CONFIRMADA',
        'CITA_COMPLETADA',
      ]);

      const audit = await db().query(
        `SELECT action, user_id, before, after FROM audit_logs
         WHERE entity = 'APPOINTMENT' AND entity_id = $1 ORDER BY id`,
        [id],
      );
      expect(audit.rows.map((r) => r.action)).toEqual([
        'APPOINTMENT_CREATED',
        'APPOINTMENT_CONFIRMED',
        'APPOINTMENT_COMPLETED',
      ]);
      expect(audit.rows[1].user_id).toBe(admin.user.id);
      expect(audit.rows[1].before).toEqual({ status: 'PENDIENTE' });
      expect(audit.rows[1].after).toEqual({ status: 'CONFIRMADA' });
    });
  });

  describe('COMPLETADA es final y las transiciones invalidas dan 409', () => {
    it('una cita COMPLETADA no cambia de estado por ninguna operacion', async () => {
      const id = await newCompleted();

      expect(
        (await api.patch(`/appointments/${id}/confirm`, admin)).status,
      ).toBe(409);
      expect(
        (await api.patch(`/appointments/${id}/complete`, admin)).status,
      ).toBe(409);
      expect(
        (
          await api
            .patch(`/appointments/${id}/cancel`, admin)
            .send({ reason: 'Intento de cancelar' })
        ).status,
      ).toBe(409);
      expect(
        (
          await api
            .patch(`/appointments/${id}/reschedule`, admin)
            .send({ scheduled_at: agenda.next().toISOString(), reason: 'x' })
        ).status,
      ).toBe(409);
      // El paciente tampoco (la regla de estado final prevalece)
      expect(
        (
          await api
            .patch(`/appointments/${id}/cancel`, patient.session)
            .send({ reason: 'x' })
        ).status,
      ).toBe(409);
      expect(await status(id)).toBe('COMPLETADA');
    });

    it('no se puede completar una PENDIENTE, ni confirmar dos veces', async () => {
      const pending = await newPending();
      expect(
        (await api.patch(`/appointments/${pending}/complete`, admin)).status,
      ).toBe(409);
      expect(await status(pending)).toBe('PENDIENTE');

      expectStatus(
        await api.patch(`/appointments/${pending}/confirm`, admin),
        200,
      );
      expect(
        (await api.patch(`/appointments/${pending}/confirm`, admin)).status,
      ).toBe(409);
      expect(await status(pending)).toBe('CONFIRMADA');
    });

    it('una CANCELADA no se confirma, completa, cancela ni reprograma, y no hay endpoint para reactivarla', async () => {
      const id = await newPending();
      expectStatus(
        await api
          .patch(`/appointments/${id}/cancel`, admin)
          .send({ reason: 'Cancelada por el consultorio' }),
        200,
      );

      expect(
        (await api.patch(`/appointments/${id}/confirm`, admin)).status,
      ).toBe(409);
      expect(
        (await api.patch(`/appointments/${id}/complete`, admin)).status,
      ).toBe(409);
      expect(
        (
          await api
            .patch(`/appointments/${id}/cancel`, admin)
            .send({ reason: 'otra' })
        ).status,
      ).toBe(409);
      expect(
        (
          await api
            .patch(`/appointments/${id}/reschedule`, admin)
            .send({ scheduled_at: agenda.next().toISOString(), reason: 'x' })
        ).status,
      ).toBe(409);
      // PATCH /appointments/:id solo edita servicio/notas: el estado se descarta (400 sin campos)
      const direct = await api
        .patch(`/appointments/${id}`, admin)
        .send({ status: 'PENDIENTE' });
      expect(direct.status).toBe(400);
      expect(await status(id)).toBe('CANCELADA');
    });

    it('una operacion fallida no genera notificaciones ni auditoria', async () => {
      const id = await newPending();
      expectStatus(
        await api
          .patch(`/appointments/${id}/cancel`, admin)
          .send({ reason: 'Primera cancelacion' }),
        200,
      );
      const notifBefore = await countRows('notifications');
      const auditBefore = await countRows('audit_logs');

      expect(
        (await api.patch(`/appointments/${id}/confirm`, admin)).status,
      ).toBe(409);

      expect(await countRows('notifications')).toBe(notifBefore);
      expect(await countRows('audit_logs')).toBe(auditBefore);
    });
  });

  describe('reglas por fecha', () => {
    it('no se confirma una cita pasada (409)', async () => {
      const id = await newPending();
      await forcePast(id);
      const res = await api.patch(`/appointments/${id}/confirm`, admin);
      expect(res.status).toBe(409);
      expect(await status(id)).toBe('PENDIENTE');
    });

    it('no se completa una cita futura (409)', async () => {
      const id = await newConfirmed();
      const res = await api.patch(`/appointments/${id}/complete`, admin);
      expect(res.status).toBe(409);
      expect(await status(id)).toBe('CONFIRMADA');
    });

    it('el paciente no cancela ni reprograma una cita pasada (409)', async () => {
      const id = await newPending();
      await forcePast(id);
      const cancel = await api
        .patch(`/appointments/${id}/cancel`, patient.session)
        .send({ reason: 'Ya paso' });
      expect(cancel.status).toBe(409);
      const resched = await api
        .patch(`/appointments/${id}/reschedule`, patient.session)
        .send({ scheduled_at: agenda.next().toISOString(), reason: 'Ya paso' });
      expect(resched.status).toBe(409);
      expect(await status(id)).toBe('PENDIENTE');
    });

    it('ADMIN y ASISTENTE si pueden cancelar o reprogramar una cita pasada', async () => {
      const a = await newPending();
      await forcePast(a);
      expectStatus(
        await api
          .patch(`/appointments/${a}/cancel`, admin)
          .send({ reason: 'Paciente no asistio' }),
        200,
      );
      const b = await newPending();
      await forcePast(b);
      expectStatus(
        await api.patch(`/appointments/${b}/reschedule`, assistant).send({
          scheduled_at: agenda.next().toISOString(),
          reason: 'Reagendada',
        }),
        200,
      );
    });
  });

  describe('cancelacion', () => {
    it('el motivo es obligatorio', async () => {
      const id = await newPending();
      for (const body of [{}, { reason: '' }, { reason: '   ' }]) {
        const res = await api
          .patch(`/appointments/${id}/cancel`, patient.session)
          .send(body);
        expect(res.status).toBe(400);
      }
      expect(await status(id)).toBe('PENDIENTE');
    });

    it('el paciente cancela su cita PENDIENTE: guarda motivo y responsable, notifica a los administradores', async () => {
      const id = await newPending();
      const res = await api
        .patch(`/appointments/${id}/cancel`, patient.session)
        .send({ reason: 'Tengo un imprevisto' });
      expectStatus(res, 200);
      expect(res.body.data.status).toBe('CANCELADA');

      const row = await db().query(
        'SELECT cancel_reason, cancelled_by_id, cancelled_at FROM appointments WHERE id = $1',
        [id],
      );
      expect(row.rows[0].cancel_reason).toBe('Tengo un imprevisto');
      expect(row.rows[0].cancelled_by_id).toBe(patient.userId);
      expect(row.rows[0].cancelled_at).not.toBeNull();

      const toAdmin = await notificationsOf(admin.user.id, id);
      expect(toAdmin.map((n) => n.type)).toContain('CITA_CANCELADA');
      // Cancela el paciente: no se notifica a si mismo
      expect(
        (await notificationsOf(patient.userId, id)).map((n) => n.type),
      ).not.toContain('CITA_CANCELADA');
    });

    it('el ADMIN cancela (incluso una CONFIRMADA) y se notifica al paciente', async () => {
      const id = await newConfirmed();
      const res = await api
        .patch(`/appointments/${id}/cancel`, admin)
        .send({ reason: 'El doctor no esta disponible' });
      expectStatus(res, 200);
      expect(await status(id)).toBe('CANCELADA');
      expect(
        (await notificationsOf(patient.userId, id)).map((n) => n.type),
      ).toEqual(['CITA_CONFIRMADA', 'CITA_CANCELADA']);
    });

    it('el paciente NO cancela ni reprograma una cita CONFIRMADA (403) y la cita no cambia', async () => {
      const id = await newConfirmed();
      const at = (
        await db().query(
          'SELECT scheduled_at FROM appointments WHERE id = $1',
          [id],
        )
      ).rows[0].scheduled_at;

      expect(
        (
          await api
            .patch(`/appointments/${id}/cancel`, patient.session)
            .send({ reason: 'Quiero cancelar' })
        ).status,
      ).toBe(403);
      expect(
        (
          await api
            .patch(`/appointments/${id}/reschedule`, patient.session)
            .send({ scheduled_at: agenda.next().toISOString(), reason: 'x' })
        ).status,
      ).toBe(403);
      expect(await status(id)).toBe('CONFIRMADA');
      const after = (
        await db().query(
          'SELECT scheduled_at FROM appointments WHERE id = $1',
          [id],
        )
      ).rows[0].scheduled_at;
      expect(after).toEqual(at);
    });

    it('el ASISTENTE puede cancelar una cita confirmada', async () => {
      const id = await newConfirmed();
      const res = await api
        .patch(`/appointments/${id}/cancel`, assistant)
        .send({ reason: 'A peticion del paciente' });
      expectStatus(res, 200);
      expect(await status(id)).toBe('CANCELADA');
    });
  });

  describe('reprogramacion como operacion con historial', () => {
    it('el paciente reprograma su cita PENDIENTE: conserva el estado, guarda historial y notifica a los administradores', async () => {
      const id = await newPending();
      const newAt = agenda.next();
      const res = await api
        .patch(`/appointments/${id}/reschedule`, patient.session)
        .send({
          scheduled_at: newAt.toISOString(),
          reason: 'Cambio de horario laboral',
        });
      expectStatus(res, 200);
      expect(res.body.data.status).toBe('PENDIENTE');
      expect(await status(id)).toBe('PENDIENTE');

      const hist = await db().query(
        'SELECT changed_by_id, reason FROM appointment_reschedules WHERE appointment_id = $1',
        [id],
      );
      expect(hist.rows).toEqual([
        { changed_by_id: patient.userId, reason: 'Cambio de horario laboral' },
      ]);
      expect(
        (await notificationsOf(admin.user.id, id)).map((n) => n.type),
      ).toContain('CITA_REPROGRAMADA');
    });

    it('el ADMIN reprograma una CONFIRMADA: sigue CONFIRMADA, notifica al paciente y audita', async () => {
      const id = await newConfirmed();
      const res = await api
        .patch(`/appointments/${id}/reschedule`, admin)
        .send({
          scheduled_at: agenda.next().toISOString(),
          reason: 'Ajuste de agenda',
        });
      expectStatus(res, 200);
      expect(res.body.data.status).toBe('CONFIRMADA');
      expect(await status(id)).toBe('CONFIRMADA');
      expect(
        (await notificationsOf(patient.userId, id)).map((n) => n.type),
      ).toEqual(['CITA_CONFIRMADA', 'CITA_REPROGRAMADA']);
      const audit = await db().query(
        `SELECT count(*)::int AS n FROM audit_logs
         WHERE action = 'APPOINTMENT_RESCHEDULED' AND entity_id = $1`,
        [id],
      );
      expect(audit.rows[0].n).toBe(1);
    });

    it('valida el nuevo horario: motivo obligatorio, no pasado, distinto del actual', async () => {
      const id = await newPending();
      const currentUtc = (
        await db().query(
          "SELECT scheduled_at AT TIME ZONE 'UTC' AS at FROM appointments WHERE id = $1",
          [id],
        )
      ).rows[0].at as Date;

      expect(
        (
          await api
            .patch(`/appointments/${id}/reschedule`, patient.session)
            .send({ scheduled_at: agenda.next().toISOString() })
        ).status,
      ).toBe(400);
      expect(
        (
          await api
            .patch(`/appointments/${id}/reschedule`, patient.session)
            .send({
              scheduled_at: new Date(Date.now() - 3600_000).toISOString(),
              reason: 'x',
            })
        ).status,
      ).toBe(400);
      expect(
        (
          await api
            .patch(`/appointments/${id}/reschedule`, patient.session)
            .send({
              scheduled_at: currentUtc.toISOString(),
              reason: 'mismo horario',
            })
        ).status,
      ).toBe(400);
      const hist = await db().query(
        'SELECT count(*)::int AS n FROM appointment_reschedules WHERE appointment_id = $1',
        [id],
      );
      expect(hist.rows[0].n).toBe(0);
    });
  });

  describe('notificaciones privadas por usuario', () => {
    it('cada usuario ve solo las suyas; se pueden marcar como leidas', async () => {
      const id = await newConfirmed(other);

      const mine = await api.get('/notifications', other.session);
      expectStatus(mine, 200);
      const confirmNotif = mine.body.data.items.find(
        (n: { type: string; appointment_id: number }) =>
          n.type === 'CITA_CONFIRMADA' && n.appointment_id === id,
      );
      expect(confirmNotif).toBeDefined();
      expect(confirmNotif.is_read).toBe(false);

      // El otro paciente no las ve ni puede marcarlas
      const theirs = await api.get('/notifications', patient.session);
      expect(
        theirs.body.data.items.map((n: { id: number }) => n.id),
      ).not.toContain(confirmNotif.id);
      expect(
        (
          await api.patch(
            `/notifications/${confirmNotif.id}/read`,
            patient.session,
          )
        ).status,
      ).toBe(404);
      // Sigue sin leer
      const still = await db().query(
        'SELECT is_read FROM notifications WHERE id = $1',
        [confirmNotif.id],
      );
      expect(still.rows[0].is_read).toBe(false);

      // El propietario si
      const unreadBefore = await api.get(
        '/notifications/unread-count',
        other.session,
      );
      expect(unreadBefore.body.data.unread).toBeGreaterThanOrEqual(1);
      expectStatus(
        await api.patch(
          `/notifications/${confirmNotif.id}/read`,
          other.session,
        ),
        200,
      );
      const row = await db().query(
        'SELECT is_read, read_at FROM notifications WHERE id = $1',
        [confirmNotif.id],
      );
      expect(row.rows[0].is_read).toBe(true);
      expect(row.rows[0].read_at).not.toBeNull();

      const unread = await api.get('/notifications?read=false', other.session);
      expect(
        unread.body.data.items.map((n: { id: number }) => n.id),
      ).not.toContain(confirmNotif.id);
      const readOnly = await api.get('/notifications?read=true', other.session);
      expect(
        readOnly.body.data.items.every((n: { is_read: boolean }) => n.is_read),
      ).toBe(true);

      const all = await api.patch('/notifications/read-all', other.session);
      expectStatus(all, 200);
      const count = await api.get('/notifications/unread-count', other.session);
      expect(count.body.data.unread).toBe(0);
      // read-all del otro usuario no afecta a las notificaciones del primero
      const adminUnread = await api.get('/notifications/unread-count', admin);
      expect(adminUnread.status).toBe(200);
    });

    it('las notificaciones del administrador no aparecen para el paciente y viceversa', async () => {
      const id = await newPending();
      expectStatus(
        await api
          .patch(`/appointments/${id}/cancel`, patient.session)
          .send({ reason: 'Aviso al administrador' }),
        200,
      );
      const adminList = await api.get('/notifications?limit=100', admin);
      expect(
        adminList.body.data.items.some(
          (n: { appointment_id: number; type: string }) =>
            n.appointment_id === id && n.type === 'CITA_CANCELADA',
        ),
      ).toBe(true);
      const patientList = await api.get(
        '/notifications?limit=100',
        patient.session,
      );
      expect(
        patientList.body.data.items.some(
          (n: { appointment_id: number; type: string }) =>
            n.appointment_id === id && n.type === 'CITA_CANCELADA',
        ),
      ).toBe(false);
    });

    it('una notificacion inexistente da 404 y sin sesion 401', async () => {
      expect(
        (await api.patch('/notifications/99999999/read', patient.session))
          .status,
      ).toBe(404);
      expect((await api.get('/notifications')).status).toBe(401);
    });
  });
});
