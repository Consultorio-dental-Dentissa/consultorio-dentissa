import type { INestApplication } from '@nestjs/common';
import { Http, Session, closeDb, createApp, db, http } from './support/app';
import {
  TestPatient,
  createActiveService,
  createAppointment,
  expectStatus,
  loginAdmin,
  makeAgenda,
  registerPatient,
} from './support/factory';

/**
 * Spec 03 / 06: disponibilidad, solapes y reservas concurrentes (peticiones
 * HTTP en paralelo contra Postgres real).
 */
describe('Citas: disponibilidad y concurrencia (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  let admin: Session;
  let patients: TestPatient[];
  let s30: { id: number };
  let s60: { id: number };
  const agenda = makeAgenda(1);

  const countAt = async (from: Date, to: Date) => {
    const r = await db().query(
      `SELECT count(*)::int AS n FROM appointments
       WHERE scheduled_at >= $1 AND scheduled_at < $2
         AND status IN ('PENDIENTE','CONFIRMADA')`,
      [from.toISOString(), to.toISOString()],
    );
    return r.rows[0].n as number;
  };

  const auditCreated = async () => {
    const r = await db().query(
      `SELECT count(*)::int AS n FROM audit_logs WHERE action = 'APPOINTMENT_CREATED'`,
    );
    return r.rows[0].n as number;
  };

  beforeAll(async () => {
    app = await createApp();
    api = http(app);
    admin = await loginAdmin(api);
    patients = [];
    for (let i = 0; i < 12; i++) patients.push(await registerPatient(api));
    s30 = await createActiveService(api, admin, 30);
    s60 = await createActiveService(api, admin, 60);
  }, 120000);

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  describe('reservas simultaneas al mismo horario', () => {
    it.each([1, 2, 3])(
      'ronda %i: 12 pacientes reservan el MISMO horario -> exactamente 1 creada, el resto 409',
      async () => {
        const at = agenda.next();
        const auditBefore = await auditCreated();

        const results = await Promise.all(
          patients.map((p) =>
            createAppointment(api, p.session, { serviceId: s30.id, at }),
          ),
        );

        const statuses = results.map((r) => r.status);
        const created = statuses.filter((s) => s === 201).length;
        const conflicts = statuses.filter((s) => s === 409).length;
        // Ningun 500: toda perdedora recibe un 409 limpio
        expect({ created, conflicts, others: statuses }).toEqual({
          created: 1,
          conflicts: 11,
          others: expect.any(Array),
        });

        const end = new Date(at.getTime() + 30 * 60_000);
        expect(await countAt(at, end)).toBe(1);
        // La auditoria viaja en la misma transaccion: las perdedoras no dejan rastro
        expect((await auditCreated()) - auditBefore).toBe(1);
      },
    );

    it('el mismo paciente enviando 10 peticiones identicas en paralelo crea solo 1 cita', async () => {
      const at = agenda.next();
      const results = await Promise.all(
        Array.from({ length: 10 }, () =>
          createAppointment(api, patients[0].session, {
            serviceId: s30.id,
            at,
          }),
        ),
      );
      const statuses = results.map((r) => r.status);
      expect(statuses.filter((s) => s === 201)).toHaveLength(1);
      expect(statuses.filter((s) => s === 409)).toHaveLength(9);
      expect(await countAt(at, new Date(at.getTime() + 1800_000))).toBe(1);
    });

    it('horarios parcialmente solapados en paralelo: solo gana 1 (inicios cada 5 min)', async () => {
      const base = agenda.next();
      const starts = Array.from(
        { length: 6 },
        (_, i) => new Date(base.getTime() + i * 5 * 60_000),
      );
      const results = await Promise.all(
        starts.map((at, i) =>
          createAppointment(api, patients[i].session, {
            serviceId: s30.id,
            at,
          }),
        ),
      );
      const statuses = results.map((r) => r.status);
      expect(statuses.filter((s) => s === 201)).toHaveLength(1);
      expect(statuses.filter((s) => s === 409)).toHaveLength(5);
      expect(await countAt(base, new Date(base.getTime() + 2 * 3600_000))).toBe(
        1,
      );
    });

    it('crear y reprogramar al mismo hueco a la vez: solo uno lo obtiene', async () => {
      const original = await createAppointment(api, patients[1].session, {
        serviceId: s30.id,
        at: agenda.next(),
      });
      expectStatus(original, 201);
      const target = agenda.next();

      const [create, resched] = await Promise.all([
        createAppointment(api, patients[2].session, {
          serviceId: s30.id,
          at: target,
        }),
        api
          .patch(
            `/appointments/${original.body.data.id}/reschedule`,
            patients[1].session,
          )
          .send({
            scheduled_at: target.toISOString(),
            reason: 'Prefiero ese horario',
          }),
      ]);
      const winners = [create.status === 201, resched.status === 200].filter(
        Boolean,
      );
      expect(winners).toHaveLength(1);
      expect(
        [create.status, resched.status].filter((s) => s === 409),
      ).toHaveLength(1);
      expect(await countAt(target, new Date(target.getTime() + 1800_000))).toBe(
        1,
      );
    });
  });

  describe('reglas de solape (existingStart < newEnd && existingEnd > newStart)', () => {
    let base: Date;
    let firstId: number;

    beforeAll(async () => {
      base = agenda.next();
      const res = await createAppointment(api, patients[0].session, {
        serviceId: s60.id,
        at: base,
      });
      expectStatus(res, 201);
      firstId = res.body.data.id;
    });

    it('la duracion del servicio define el fin (60 min), no una duracion fija', async () => {
      const row = await db().query(
        'SELECT "durationMinutes" AS d FROM appointments WHERE id = $1',
        [firstId],
      );
      expect(row.rows[0].d).toBe(60);
      // 45 min despues: choca con una cita de 60
      const clash = await createAppointment(api, patients[1].session, {
        serviceId: s30.id,
        at: new Date(base.getTime() + 45 * 60_000),
      });
      expect(clash.status).toBe(409);
    });

    it('solape parcial por delante, por detras, contenida y envolvente -> 409', async () => {
      const cases = [
        new Date(base.getTime() - 15 * 60_000), // 30 min: termina a +15 de la existente
        new Date(base.getTime() + 59 * 60_000), // empieza 1 min antes de que termine
        new Date(base.getTime() + 10 * 60_000), // dentro
      ];
      for (const at of cases) {
        const res = await createAppointment(api, patients[2].session, {
          serviceId: s30.id,
          at,
        });
        expect(res.status).toBe(409);
      }
      // Envolvente: 60 min que empieza antes y cubre la existente
      const wrap = await createAppointment(api, patients[2].session, {
        serviceId: s60.id,
        at: new Date(base.getTime() - 30 * 60_000),
      });
      expect(wrap.status).toBe(409);
    });

    it('citas adyacentes (fin == inicio) SI se permiten, antes y despues', async () => {
      const after = await createAppointment(api, patients[3].session, {
        serviceId: s30.id,
        at: new Date(base.getTime() + 60 * 60_000),
      });
      expectStatus(after, 201);
      const before = await createAppointment(api, patients[4].session, {
        serviceId: s30.id,
        at: new Date(base.getTime() - 30 * 60_000),
      });
      expectStatus(before, 201);
    });

    it('PENDIENTE y CONFIRMADA bloquean; CANCELADA libera el horario', async () => {
      const at = agenda.next();
      const created = await createAppointment(api, patients[5].session, {
        serviceId: s30.id,
        at,
      });
      expectStatus(created, 201);
      const id = created.body.data.id;

      // PENDIENTE bloquea
      expect(
        (
          await createAppointment(api, patients[6].session, {
            serviceId: s30.id,
            at,
          })
        ).status,
      ).toBe(409);

      // CONFIRMADA bloquea
      expectStatus(await api.patch(`/appointments/${id}/confirm`, admin), 200);
      expect(
        (
          await createAppointment(api, patients[6].session, {
            serviceId: s30.id,
            at,
          })
        ).status,
      ).toBe(409);

      // CANCELADA libera
      expectStatus(
        await api
          .patch(`/appointments/${id}/cancel`, admin)
          .send({ reason: 'Se libera el horario' }),
        200,
      );
      const reuse = await createAppointment(api, patients[6].session, {
        serviceId: s30.id,
        at,
      });
      expectStatus(reuse, 201);
    });

    it('reprogramar a un horario ocupado -> 409 y la cita conserva su horario, sin historial ni notificacion', async () => {
      const mine = await createAppointment(api, patients[7].session, {
        serviceId: s30.id,
        at: agenda.next(),
      });
      expectStatus(mine, 201);
      const id = mine.body.data.id;
      const before = await db().query(
        'SELECT scheduled_at FROM appointments WHERE id = $1',
        [id],
      );
      const notifBefore = await db().query(
        'SELECT count(*)::int AS n FROM notifications',
      );

      const res = await api
        .patch(`/appointments/${id}/reschedule`, patients[7].session)
        .send({
          scheduled_at: new Date(base.getTime() + 20 * 60_000).toISOString(),
          reason: 'Quiero ese horario',
        });
      expect(res.status).toBe(409);

      const after = await db().query(
        'SELECT scheduled_at FROM appointments WHERE id = $1',
        [id],
      );
      expect(after.rows[0].scheduled_at).toEqual(before.rows[0].scheduled_at);
      const hist = await db().query(
        'SELECT count(*)::int AS n FROM appointment_reschedules WHERE appointment_id = $1',
        [id],
      );
      expect(hist.rows[0].n).toBe(0);
      const notifAfter = await db().query(
        'SELECT count(*)::int AS n FROM notifications',
      );
      expect(notifAfter.rows[0].n).toBe(notifBefore.rows[0].n);
    });

    it('reprogramar libera el horario anterior y reserva el nuevo (historial con anterior, nuevo y responsable)', async () => {
      const oldAt = agenda.next();
      const newAt = agenda.next();
      const created = await createAppointment(api, patients[8].session, {
        serviceId: s30.id,
        at: oldAt,
      });
      expectStatus(created, 201);
      const id = created.body.data.id;

      const res = await api
        .patch(`/appointments/${id}/reschedule`, patients[8].session)
        .send({
          scheduled_at: newAt.toISOString(),
          reason: 'Cambio de planes',
        });
      expectStatus(res, 200);

      // El horario anterior queda libre
      const reuse = await createAppointment(api, patients[9].session, {
        serviceId: s30.id,
        at: oldAt,
      });
      expectStatus(reuse, 201);
      // El nuevo queda ocupado
      const clash = await createAppointment(api, patients[9].session, {
        serviceId: s30.id,
        at: newAt,
      });
      expect(clash.status).toBe(409);

      const hist = await db().query(
        `SELECT previous_scheduled_at AT TIME ZONE 'UTC' AS previous_scheduled_at,
                new_scheduled_at AT TIME ZONE 'UTC' AS new_scheduled_at, changed_by_id, reason
         FROM appointment_reschedules WHERE appointment_id = $1`,
        [id],
      );
      expect(hist.rows).toHaveLength(1);
      expect(new Date(hist.rows[0].previous_scheduled_at).toISOString()).toBe(
        oldAt.toISOString(),
      );
      expect(new Date(hist.rows[0].new_scheduled_at).toISOString()).toBe(
        newAt.toISOString(),
      );
      expect(hist.rows[0].changed_by_id).toBe(patients[8].userId);
      expect(hist.rows[0].reason).toBe('Cambio de planes');
    });
  });

  describe('validaciones de creacion', () => {
    it('no se crean citas en el pasado', async () => {
      const res = await createAppointment(api, patients[0].session, {
        serviceId: s30.id,
        at: new Date(Date.now() - 3600_000),
      });
      expect(res.status).toBe(400);
    });

    it('fecha invalida, servicio inexistente y servicio inactivo se rechazan', async () => {
      const bad = await api
        .post('/appointments', patients[0].session)
        .send({ scheduled_at: 'no-es-fecha', notes: 'x', service_id: s30.id });
      expect(bad.status).toBe(400);

      const missing = await createAppointment(api, patients[0].session, {
        serviceId: 99999999,
        at: agenda.next(),
      });
      expect(missing.status).toBe(404);

      const inactive = await api.post('/services', admin).send({
        name: `Inactivo ${Date.now()}`,
        durationMinutes: 30,
        description: 'inactivo',
        price: 1,
      });
      expectStatus(inactive, 201);
      const res = await createAppointment(api, patients[0].session, {
        serviceId: inactive.body.data.id,
        at: agenda.next(),
      });
      expect(res.status).toBe(400);
    });

    it('el ADMIN debe indicar el paciente; un paciente inexistente da 404', async () => {
      const noPatient = await createAppointment(api, admin, {
        serviceId: s30.id,
        at: agenda.next(),
      });
      expect(noPatient.status).toBe(400);
      const ghost = await createAppointment(api, admin, {
        serviceId: s30.id,
        at: agenda.next(),
        patientId: 99999999,
      });
      expect(ghost.status).toBe(404);
    });
  });
});
