import type { INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Http, Session, closeDb, createApp, db, http } from './support/app';
import {
  TestPatient,
  createActiveService,
  createAppointment,
  createStaff,
  expectStatus,
  jpegBuffer,
  loginAdmin,
  makeAgenda,
  pngBuffer,
  registerPatient,
} from './support/factory';

const SECRET_TEXT = 'DIAGNOSTICO-RESERVADO-XYZ';

/**
 * Spec 06 (consultas): solo sobre cita COMPLETADA, una por cita, maximo 5
 * imagenes, sin acceso clinico no autorizado. Imagenes privadas.
 */
describe('Consultas e imagenes privadas (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  let admin: Session;
  let assistant: Session;
  let patient: TestPatient;
  let other: TestPatient;
  let service: { id: number };
  const agenda = makeAgenda(3);
  let pastSeq = 0;

  const storageRoot = () => process.env.STORAGE_DIR!;
  const consultationsDir = () =>
    path.join(storageRoot(), 'private', 'consultations');
  const filesOnDisk = () =>
    fs.existsSync(consultationsDir()) ? fs.readdirSync(consultationsDir()) : [];

  const forcePast = async (id: number) => {
    pastSeq += 1;
    const past = new Date(Date.UTC(2019, 0, 1) + pastSeq * 3 * 3600_000);
    await db().query(
      'UPDATE appointments SET scheduled_at = $1 WHERE id = $2',
      [past.toISOString(), id],
    );
  };

  const newPending = async (who: TestPatient = patient) => {
    const res = await createAppointment(api, who.session, {
      serviceId: service.id,
      at: agenda.next(),
    });
    expectStatus(res, 201);
    return res.body.data.id as number;
  };

  const newCompleted = async (who: TestPatient = patient) => {
    const id = await newPending(who);
    expectStatus(await api.patch(`/appointments/${id}/confirm`, admin), 200);
    await forcePast(id);
    expectStatus(await api.patch(`/appointments/${id}/complete`, admin), 200);
    return id;
  };

  const newConsultation = async (appointmentId?: number) => {
    const apptId = appointmentId ?? (await newCompleted());
    const res = await api.post('/consultations', admin).send({
      appointment_id: apptId,
      description: `Descripcion ${SECRET_TEXT}`,
      dentistObservations: `Obs ${SECRET_TEXT}`,
    });
    expectStatus(res, 201);
    return { id: res.body.data.id as number, appointmentId: apptId };
  };

  const upload = (
    consultationId: number,
    who: Session | null,
    files: { buf: Buffer; name: string; type: string }[],
  ) => {
    let req = api.post(`/consultations/${consultationId}/images`, who);
    for (const f of files) {
      req = req.attach('images', f.buf, {
        filename: f.name,
        contentType: f.type,
      });
    }
    return req;
  };
  const png = (name = 'a.png') => ({
    buf: pngBuffer(),
    name,
    type: 'image/png',
  });

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

  it('el almacenamiento de pruebas es un directorio temporal aislado', () => {
    expect(storageRoot()).toBeTruthy();
    expect(path.dirname(storageRoot())).toBe(os.tmpdir());
    expect(storageRoot()).toBe(process.env.E2E_STORAGE_DIR);
  });

  describe('creacion: solo sobre cita COMPLETADA y una por cita', () => {
    it('PENDIENTE, CONFIRMADA y CANCELADA -> 409; cita inexistente -> 404', async () => {
      const pending = await newPending();
      const confirmed = await newPending();
      expectStatus(
        await api.patch(`/appointments/${confirmed}/confirm`, admin),
        200,
      );
      const cancelled = await newPending();
      expectStatus(
        await api
          .patch(`/appointments/${cancelled}/cancel`, admin)
          .send({ reason: 'cancelada para la prueba' }),
        200,
      );

      for (const id of [pending, confirmed, cancelled]) {
        const res = await api
          .post('/consultations', admin)
          .send({ appointment_id: id, description: 'x' });
        expect(res.status).toBe(409);
      }
      const missing = await api
        .post('/consultations', admin)
        .send({ appointment_id: 999999, description: 'x' });
      expect(missing.status).toBe(404);

      const { rows } = await db().query(
        'SELECT count(*)::int AS n FROM consultations WHERE appointment_id = ANY($1)',
        [[pending, confirmed, cancelled]],
      );
      expect(rows[0].n).toBe(0);
    });

    it('validacion: descripcion obligatoria y appointment_id entero', async () => {
      const id = await newCompleted();
      expect(
        (await api.post('/consultations', admin).send({ appointment_id: id }))
          .status,
      ).toBe(400);
      expect(
        (
          await api
            .post('/consultations', admin)
            .send({ appointment_id: 'abc', description: 'x' })
        ).status,
      ).toBe(400);
    });

    it('COMPLETADA -> 201, notifica al paciente sin datos clinicos y audita sin contenido; la segunda -> 409', async () => {
      const apptId = await newCompleted();
      const created = await api.post('/consultations', admin).send({
        appointment_id: apptId,
        description: `Descripcion ${SECRET_TEXT}`,
        dentistObservations: `Obs ${SECRET_TEXT}`,
      });
      expectStatus(created, 201);
      const id = created.body.data.id as number;
      expect(created.body.data.created_by_id).toBe(admin.user.id);

      const dup = await api
        .post('/consultations', admin)
        .send({ appointment_id: apptId, description: 'otra' });
      expect(dup.status).toBe(409);
      const count = await db().query(
        'SELECT count(*)::int AS n FROM consultations WHERE appointment_id = $1',
        [apptId],
      );
      expect(count.rows[0].n).toBe(1);

      const notes = await db().query(
        `SELECT type, message FROM notifications WHERE appointment_id = $1 AND type = 'CONSULTA_REGISTRADA'`,
        [apptId],
      );
      expect(notes.rowCount).toBe(1);
      expect(JSON.stringify(notes.rows)).not.toContain(SECRET_TEXT);

      const audit = await db().query(
        `SELECT user_id, before, after FROM audit_logs
         WHERE action = 'CONSULTATION_CREATED' AND entity_id = $1`,
        [id],
      );
      expect(audit.rowCount).toBe(1);
      expect(audit.rows[0].user_id).toBe(admin.user.id);
      expect(JSON.stringify(audit.rows[0])).not.toContain(SECRET_TEXT);

      // el paciente no ve el contenido clinico en su cita ni en sus notificaciones
      const detail = await api.get(`/appointments/${apptId}`, patient.session);
      expectStatus(detail, 200);
      expect(JSON.stringify(detail.body)).not.toContain(SECRET_TEXT);
      const mine = await api.get('/notifications', patient.session);
      expect(JSON.stringify(mine.body)).not.toContain(SECRET_TEXT);
    });

    it('10 altas simultaneas de la misma cita -> exactamente una consulta', async () => {
      const apptId = await newCompleted();
      const results = await Promise.all(
        Array.from({ length: 10 }, () =>
          api
            .post('/consultations', admin)
            .send({ appointment_id: apptId, description: 'carrera' }),
        ),
      );
      expect(results.filter((r) => r.status === 201)).toHaveLength(1);
      expect(results.filter((r) => r.status === 409)).toHaveLength(9);
      const { rows } = await db().query(
        'SELECT count(*)::int AS n FROM consultations WHERE appointment_id = $1',
        [apptId],
      );
      expect(rows[0].n).toBe(1);
    });
  });

  describe('acceso clinico: solo ADMINISTRADOR', () => {
    let consultation: { id: number; appointmentId: number };
    let imageId: number;

    beforeAll(async () => {
      consultation = await newConsultation();
      const up = await upload(consultation.id, admin, [png()]);
      expectStatus(up, 201);
      imageId = up.body.data.images[0].id;
    });

    it('sin sesion -> 401; PACIENTE (incluido el duenio) y ASISTENTE -> 403 en todas las rutas', async () => {
      const base = `/consultations/${consultation.id}`;
      const probes: ['get' | 'post' | 'patch' | 'delete', string][] = [
        ['get', '/consultations'],
        ['get', base],
        ['post', '/consultations'],
        ['patch', base],
        ['post', `${base}/images`],
        ['get', `${base}/images/${imageId}`],
        ['delete', `${base}/images/${imageId}`],
      ];
      for (const [method, url] of probes) {
        expect((await api[method](url)).status).toBe(401);
        for (const who of [patient.session, other.session, assistant]) {
          const res = await api[method](url, who).send({});
          expect([method, url, res.status]).toEqual([method, url, 403]);
        }
      }
      // nada cambio
      const { rows } = await db().query(
        'SELECT count(*)::int AS n FROM consultations_images WHERE consultation_id = $1',
        [consultation.id],
      );
      expect(rows[0].n).toBe(1);
    });

    it('el ADMIN lista y consulta; el listado esta paginado y filtra por paciente', async () => {
      const list = await api.get(
        `/consultations?patient_id=${patient.patientId}&limit=2&page=1`,
        admin,
      );
      expectStatus(list, 200);
      expect(list.body.data.items.length).toBeLessThanOrEqual(2);
      expect(list.body.data.total).toBeGreaterThanOrEqual(1);
      expect(list.body.data.limit).toBe(2);
      for (const item of list.body.data.items) {
        expect(item.patient.id).toBe(patient.patientId);
      }
      const none = await api.get(
        `/consultations?patient_id=${other.patientId}`,
        admin,
      );
      expect(none.body.data.total).toBe(0);

      const one = await api.get(`/consultations/${consultation.id}`, admin);
      expectStatus(one, 200);
      expect(one.body.data.description).toContain(SECRET_TEXT);
      expect((await api.get('/consultations/999999', admin)).status).toBe(404);
    });

    it('PATCH: actualiza, audita solo los campos cambiados y exige al menos un campo', async () => {
      const upd = await api
        .patch(`/consultations/${consultation.id}`, admin)
        .send({ description: `Nueva ${SECRET_TEXT}` });
      expectStatus(upd, 200);
      expect(upd.body.data.updated_by_id).toBe(admin.user.id);
      expect(
        (await api.patch(`/consultations/${consultation.id}`, admin).send({}))
          .status,
      ).toBe(400);
      const audit = await db().query(
        `SELECT after FROM audit_logs WHERE action = 'CONSULTATION_UPDATED' AND entity_id = $1`,
        [consultation.id],
      );
      expect(audit.rows[0].after).toEqual({ changedFields: ['description'] });
    });
  });

  describe('subida de imagenes', () => {
    it('JPEG y PNG validos -> 201; el nombre en disco lo genera el servidor y no se expone', async () => {
      const c = await newConsultation();
      const before = filesOnDisk().length;
      const res = await upload(c.id, admin, [
        png('../../evil name.png'),
        { buf: jpegBuffer(), name: 'foto.jpg', type: 'image/jpeg' },
      ]);
      expectStatus(res, 201);
      expect(res.body.data.images).toHaveLength(2);
      expect(res.body.data.images[0].url).toBe(
        `/consultations/${c.id}/images/${res.body.data.images[0].id}`,
      );
      const after = filesOnDisk();
      expect(after.length).toBe(before + 2);
      expect(after.every((n) => /^[a-f0-9]{32}\.(jpg|png|webp)$/.test(n))).toBe(
        true,
      );
      expect(JSON.stringify(res.body)).not.toMatch(/[a-f0-9]{32}\.(jpg|png)/);
      expect(JSON.stringify(res.body)).not.toContain('evil');
    });

    it('rechaza contenido que no es imagen, MIME no permitido, firma que no coincide y archivos vacios, sin dejar archivos', async () => {
      const c = await newConsultation();
      const before = filesOnDisk().length;
      const cases: { buf: Buffer; name: string; type: string }[] = [
        // texto/script declarado como PNG (magic bytes invalidos)
        {
          buf: Buffer.from('<script>alert(1)</script>'),
          name: 'a.png',
          type: 'image/png',
        },
        // PNG real declarado como JPEG
        { buf: pngBuffer(), name: 'a.jpg', type: 'image/jpeg' },
        // MIME no permitido aunque el contenido sea PNG
        { buf: pngBuffer(), name: 'a.gif', type: 'image/gif' },
        { buf: pngBuffer(), name: 'a.svg', type: 'image/svg+xml' },
        {
          buf: Buffer.from('%PDF-1.4 ...'),
          name: 'a.pdf',
          type: 'application/pdf',
        },
        // extension .png pero contenido ejecutable
        {
          buf: Buffer.from('MZ\x90\x00\x03\x00'),
          name: 'virus.png',
          type: 'image/png',
        },
      ];
      for (const file of cases) {
        const res = await upload(c.id, admin, [file]);
        expect([file.name, res.status]).toEqual([file.name, 400]);
      }
      const empty = await upload(c.id, admin, [
        { buf: Buffer.alloc(0), name: 'e.png', type: 'image/png' },
      ]);
      expect(empty.status).toBe(400);
      // sin archivos
      expect(
        (await api.post(`/consultations/${c.id}/images`, admin)).status,
      ).toBe(400);
      // un archivo invalido junto a uno valido: no se guarda ninguno
      const mixed = await upload(c.id, admin, [
        png(),
        { buf: Buffer.from('no soy imagen'), name: 'b.png', type: 'image/png' },
      ]);
      expect(mixed.status).toBe(400);

      expect(filesOnDisk().length).toBe(before);
      const { rows } = await db().query(
        'SELECT count(*)::int AS n FROM consultations_images WHERE consultation_id = $1',
        [c.id],
      );
      expect(rows[0].n).toBe(0);
    });

    it('imagen de mas de 5 MB -> rechazada', async () => {
      const c = await newConsultation();
      const big = Buffer.concat([
        pngBuffer(0),
        Buffer.alloc(5 * 1024 * 1024 + 10),
      ]);
      const res = await upload(c.id, admin, [
        { buf: big, name: 'big.png', type: 'image/png' },
      ]);
      expect([400, 413]).toContain(res.status);
    });

    it('maximo 5 imagenes por consulta (en una peticion y acumuladas) y sin huerfanos', async () => {
      const c = await newConsultation();
      const six = await upload(
        c.id,
        admin,
        Array.from({ length: 6 }, () => png()),
      );
      expect(six.status).toBe(400);

      const before = filesOnDisk().length;
      expectStatus(await upload(c.id, admin, [png(), png(), png()]), 201);
      const over = await upload(c.id, admin, [png(), png(), png()]);
      expect(over.status).toBe(400);
      expect(filesOnDisk().length).toBe(before + 3); // los 3 rechazados se limpiaron

      const two = await upload(c.id, admin, [png(), png()]);
      expectStatus(two, 201);
      expect(two.body.data.images).toHaveLength(5);
      const sixth = await upload(c.id, admin, [png()]);
      expect(sixth.status).toBe(400);
      const { rows } = await db().query(
        'SELECT count(*)::int AS n FROM consultations_images WHERE consultation_id = $1',
        [c.id],
      );
      expect(rows[0].n).toBe(5);
    });

    it('subidas simultaneas no superan el maximo de 5', async () => {
      const c = await newConsultation();
      const results = await Promise.all(
        Array.from({ length: 4 }, () => upload(c.id, admin, [png(), png()])),
      );
      expect(results.filter((r) => r.status === 201).length).toBe(2);
      const { rows } = await db().query(
        'SELECT count(*)::int AS n FROM consultations_images WHERE consultation_id = $1',
        [c.id],
      );
      expect(rows[0].n).toBe(4);
      expect(filesOnDisk().length).toBeGreaterThanOrEqual(4);
    });

    it('consulta inexistente -> 404 y no queda archivo', async () => {
      const before = filesOnDisk().length;
      const res = await upload(999999, admin, [png()]);
      expect(res.status).toBe(404);
      expect(filesOnDisk().length).toBe(before);
    });
  });

  describe('descarga y borrado', () => {
    it('el ADMIN descarga la imagen con cabeceras seguras y el contenido exacto', async () => {
      const c = await newConsultation();
      const file = png();
      const up = await upload(c.id, admin, [file]);
      expectStatus(up, 201);
      const imageId = up.body.data.images[0].id;

      const res = await api
        .get(`/consultations/${c.id}/images/${imageId}`, admin)
        .buffer(true)
        .parse((r, cb) => {
          const chunks: Buffer[] = [];
          r.on('data', (d: Buffer) => chunks.push(d));
          r.on('end', () => cb(null, Buffer.concat(chunks)));
        });
      expectStatus(res, 200);
      expect(res.headers['content-type']).toBe('image/png');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['cache-control']).toMatch(/private/);
      expect(res.headers['cache-control']).toMatch(/no-store/);
      expect((res.body as Buffer).equals(file.buf)).toBe(true);
    });

    it('imagen inexistente o de OTRA consulta -> 404; ids no numericos -> 400', async () => {
      const a = await newConsultation();
      const b = await newConsultation();
      const up = await upload(a.id, admin, [png()]);
      const imageId = up.body.data.images[0].id;
      expect(
        (await api.get(`/consultations/${b.id}/images/${imageId}`, admin))
          .status,
      ).toBe(404);
      expect(
        (await api.get(`/consultations/${a.id}/images/999999`, admin)).status,
      ).toBe(404);
      expect(
        (await api.get(`/consultations/${a.id}/images/abc`, admin)).status,
      ).toBe(400);
      // intentar borrar con la consulta equivocada tampoco funciona
      expect(
        (await api.delete(`/consultations/${b.id}/images/${imageId}`, admin))
          .status,
      ).toBe(404);
    });

    it('path traversal: ni en la URL ni con un nombre manipulado en la BD se sale del directorio', async () => {
      const c = await newConsultation();
      const up = await upload(c.id, admin, [png()]);
      const imageId = up.body.data.images[0].id;

      for (const evil of [
        '..%2F..%2F..%2Fetc%2Fpasswd',
        '..%5C..%5Cwindows%5Cwin.ini',
        '%2e%2e%2f%2e%2e%2fsecret',
      ]) {
        const res = await api.get(
          `/consultations/${c.id}/images/${evil}`,
          admin,
        );
        expect([400, 404]).toContain(res.status);
      }

      // Archivo fuera del area con el mismo patron de nombre: no debe servirse
      const outside = path.join(storageRoot(), 'outside.png');
      fs.writeFileSync(outside, pngBuffer());
      for (const url of [
        '../../outside.png',
        '..\\..\\outside.png',
        `../../${'a'.repeat(32)}.png`,
        '/etc/passwd',
        'C:\\Windows\\win.ini',
        `${'a'.repeat(32)}.png\0.txt`,
      ]) {
        await db().query(
          'UPDATE consultations_images SET url = $1 WHERE id = $2',
          [url.replace(/\0/g, ''), imageId],
        );
        const res = await api.get(
          `/consultations/${c.id}/images/${imageId}`,
          admin,
        );
        expect([url, res.status]).toEqual([url, 404]);
      }
    });

    it('borrar la imagen elimina la fila y el archivo, y audita sin contenido', async () => {
      const c = await newConsultation();
      const before = filesOnDisk();
      const up = await upload(c.id, admin, [png(), png()]);
      const [first, second] = up.body.data.images as { id: number }[];
      const added = filesOnDisk().filter((n) => !before.includes(n));
      expect(added).toHaveLength(2);

      const del = await api.delete(
        `/consultations/${c.id}/images/${first.id}`,
        admin,
      );
      expectStatus(del, 200);
      expect(filesOnDisk().length).toBe(before.length + 1);
      expect(
        (await api.get(`/consultations/${c.id}/images/${first.id}`, admin))
          .status,
      ).toBe(404);
      expect(
        (await api.get(`/consultations/${c.id}/images/${second.id}`, admin))
          .status,
      ).toBe(200);
      expect(
        (await api.delete(`/consultations/${c.id}/images/${first.id}`, admin))
          .status,
      ).toBe(404);

      const audit = await db().query(
        `SELECT action FROM audit_logs WHERE entity = 'CONSULTATION' AND entity_id = $1 ORDER BY id`,
        [c.id],
      );
      expect(audit.rows.map((r) => r.action)).toEqual([
        'CONSULTATION_CREATED',
        'CONSULTATION_IMAGE_ADDED',
        'CONSULTATION_IMAGE_DELETED',
      ]);
    });
  });
});
