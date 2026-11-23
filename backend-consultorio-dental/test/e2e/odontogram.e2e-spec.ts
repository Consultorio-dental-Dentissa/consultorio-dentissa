import type { INestApplication } from '@nestjs/common';
import { Http, Session, closeDb, createApp, db, http } from './support/app';
import {
  TestPatient,
  createStaff,
  expectStatus,
  loginAdmin,
  registerPatient,
} from './support/factory';

const SECRET_NOTE = 'NOTA-ODONTOGRAMA-PRIVADA-ZXC';

describe('Odontograma (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  let admin: Session;
  let assistant: Session;
  let patient: TestPatient;
  let other: TestPatient;

  const url = (id: number, tooth?: number) =>
    `/patients/${id}/odontogram${tooth !== undefined ? `/${tooth}` : ''}`;

  beforeAll(async () => {
    app = await createApp();
    api = http(app);
    admin = await loginAdmin(api);
    assistant = (await createStaff(api, admin, 'ASISTENTE')).session;
    patient = await registerPatient(api);
    other = await registerPatient(api);
  }, 120000);

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  it('GET devuelve los 32 dientes ordenados, SANO y sin nota por defecto', async () => {
    const res = await api.get(url(patient.patientId), admin);
    expectStatus(res, 200);
    expect(res.body.data.patient_id).toBe(patient.patientId);
    const teeth = res.body.data.teeth as {
      tooth_number: number;
      status: string;
      notes: string | null;
      updated_at: string | null;
    }[];
    expect(teeth).toHaveLength(32);
    expect(teeth.map((t) => t.tooth_number)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32,
      33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48,
    ]);
    for (const t of teeth) {
      expect(t).toMatchObject({
        status: 'SANO',
        notes: null,
        updated_at: null,
      });
    }
    const rows = await db().query(
      'SELECT count(*)::int AS n FROM tooth_records WHERE patient_id = $1',
      [patient.patientId],
    );
    expect(rows.rows[0].n).toBe(0);
  });

  it('PUT cambia el diente, se refleja en GET y solo afecta a ese paciente', async () => {
    const put = await api
      .put(url(patient.patientId, 36), admin)
      .send({ status: 'CARIES', notes: `  ${SECRET_NOTE}  ` });
    expectStatus(put, 200);
    expect(put.body.data).toMatchObject({
      tooth_number: 36,
      status: 'CARIES',
      notes: SECRET_NOTE,
    });
    expect(put.body.data.updated_at).toBeTruthy();

    const get = await api.get(url(patient.patientId), admin);
    const t36 = get.body.data.teeth.find(
      (t: { tooth_number: number }) => t.tooth_number === 36,
    );
    expect(t36).toMatchObject({ status: 'CARIES', notes: SECRET_NOTE });
    expect(
      get.body.data.teeth.filter(
        (t: { status: string }) => t.status === 'SANO',
      ),
    ).toHaveLength(31);

    const otherGet = await api.get(url(other.patientId), admin);
    expect(
      otherGet.body.data.teeth.every(
        (t: { status: string }) => t.status === 'SANO',
      ),
    ).toBe(true);

    // Nota vacia => null; cambia de estado
    const cleared = await api
      .put(url(patient.patientId, 36), admin)
      .send({ status: 'CORONA', notes: '   ' });
    expectStatus(cleared, 200);
    expect(cleared.body.data).toMatchObject({ status: 'CORONA', notes: null });
  });

  it('PUT sin cambios es idempotente y no escribe auditoria', async () => {
    const body = { status: 'REMOVIDO' };
    expectStatus(
      await api.put(url(patient.patientId, 11), admin).send(body),
      200,
    );
    const count = async () =>
      (
        await db().query(
          `SELECT count(*)::int AS n FROM audit_logs
           WHERE action = 'ODONTOGRAM_TOOTH_UPDATED' AND entity_id = $1`,
          [patient.patientId],
        )
      ).rows[0].n as number;
    const before = await count();
    expectStatus(
      await api.put(url(patient.patientId, 11), admin).send(body),
      200,
    );
    expect(await count()).toBe(before);
  });

  it('paciente con cuenta desactivada: se puede consultar y editar', async () => {
    const target = await registerPatient(api);
    expectStatus(
      await api
        .patch(`/users/status/${target.userId}`, admin)
        .send({ estado: false }),
      200,
    );
    expectStatus(await api.get(url(target.patientId), admin), 200);
    expectStatus(
      await api
        .put(url(target.patientId, 21), admin)
        .send({ status: 'CARIES' }),
      200,
    );
  });

  it('paciente inexistente -> 404', async () => {
    expect((await api.get(url(999999), admin)).status).toBe(404);
    expect(
      (await api.put(url(999999, 11), admin).send({ status: 'CARIES' })).status,
    ).toBe(404);
  });

  it('ASISTENTE y PACIENTE reciben 403; sin sesion 401', async () => {
    for (const who of [assistant, patient.session]) {
      expect((await api.get(url(patient.patientId), who)).status).toBe(403);
      expect(
        (
          await api
            .put(url(patient.patientId, 11), who)
            .send({ status: 'CARIES' })
        ).status,
      ).toBe(403);
    }
    expect((await api.get(url(patient.patientId), null)).status).toBe(401);
    expect(
      (
        await api
          .put(url(patient.patientId, 11), null)
          .send({ status: 'CARIES' })
      ).status,
    ).toBe(401);
  });

  it('valida diente, estado y longitud de la nota (400)', async () => {
    for (const tooth of [10, 19, 49, 51, 99, 0]) {
      expect(
        (
          await api
            .put(url(patient.patientId, tooth), admin)
            .send({ status: 'CARIES' })
        ).status,
      ).toBe(400);
    }
    expect(
      (
        await api
          .put(`${url(patient.patientId)}/abc`, admin)
          .send({ status: 'CARIES' })
      ).status,
    ).toBe(400);
    expect(
      (
        await api
          .put(url(patient.patientId, 12), admin)
          .send({ status: 'ROTO' })
      ).status,
    ).toBe(400);
    expect(
      (await api.put(url(patient.patientId, 12), admin).send({})).status,
    ).toBe(400);
    expect(
      (
        await api
          .put(url(patient.patientId, 12), admin)
          .send({ status: 'CARIES', notes: 'a'.repeat(301) })
      ).status,
    ).toBe(400);
    expectStatus(
      await api
        .put(url(patient.patientId, 12), admin)
        .send({ status: 'CARIES', notes: 'a'.repeat(300) }),
      200,
    );
  });

  it('la BD rechaza numeros de diente fuera de FDI (CHECK)', async () => {
    await expect(
      db().query(
        `INSERT INTO tooth_records (patient_id, tooth_number, status, updated_at)
         VALUES ($1, 99, 'CARIES', now())`,
        [patient.patientId],
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('la auditoria registra quien y que, sin el contenido de la nota', async () => {
    const target = await registerPatient(api);
    expectStatus(
      await api
        .put(url(target.patientId, 46), admin)
        .send({ status: 'CARIES', notes: SECRET_NOTE }),
      200,
    );
    const logs = await api.get(
      `/audit-logs?action=ODONTOGRAM_TOOTH_UPDATED&entity=PATIENT&entityId=${target.patientId}`,
      admin,
    );
    expectStatus(logs, 200);
    expect(logs.body.data.items).toHaveLength(1);
    const entry = logs.body.data.items[0];
    expect(entry.user_id).toBe(admin.user.id);
    expect(entry.before).toEqual({ tooth_number: 46, status: 'SANO' });
    expect(entry.after).toEqual({
      tooth_number: 46,
      status: 'CARIES',
      note_changed: true,
    });

    const raw = await db().query(
      `SELECT before::text AS b, after::text AS a FROM audit_logs
       WHERE action = 'ODONTOGRAM_TOOTH_UPDATED' AND entity_id = $1`,
      [target.patientId],
    );
    expect(JSON.stringify(raw.rows)).not.toContain(SECRET_NOTE);
  });
});
