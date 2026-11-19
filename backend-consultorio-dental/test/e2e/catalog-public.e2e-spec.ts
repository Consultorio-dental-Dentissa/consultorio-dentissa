import type { INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Http, Session, closeDb, createApp, db, http } from './support/app';
import {
  TestPatient,
  createActiveService,
  createStaff,
  expectStatus,
  loginAdmin,
  pngBuffer,
  registerPatient,
  uniq,
} from './support/factory';

const DAY = 86_400_000;

/**
 * Spec 06 (servicios y ofertas) + paginas publicas (servicios activos, ofertas
 * vigentes, FAQ activas) + limpieza de archivos eliminados o sustituidos.
 */
describe('Catalogo publico y limpieza de archivos (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  let admin: Session;
  let patient: TestPatient;

  const dirOf = (area: 'services' | 'offers') =>
    path.join(process.env.STORAGE_DIR!, 'public', area);
  const files = (area: 'services' | 'offers') =>
    fs.existsSync(dirOf(area)) ? fs.readdirSync(dirOf(area)) : [];

  const pngFile = (name = 'a.png') => ({
    buf: pngBuffer(),
    name,
    type: 'image/png',
  });

  const createInactiveService = async () => {
    const res = await api.post('/services', admin).send({
      name: uniq('Inactivo '),
      durationMinutes: 30,
      description: 'sin activar',
      price: 50,
    });
    expectStatus(res, 201);
    return res.body.data as { id: number; name: string; status: boolean };
  };

  const offerBody = (over: Record<string, unknown> = {}) => ({
    name: uniq('Oferta '),
    description: 'Descripcion de oferta',
    start_date: new Date(Date.now() - 3_600_000).toISOString(),
    end_date: new Date(Date.now() + 7 * DAY).toISOString(),
    status: true,
    ...over,
  });

  beforeAll(async () => {
    app = await createApp();
    api = http(app);
    admin = await loginAdmin(api);
    patient = await registerPatient(api);
  }, 120000);

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  describe('servicios publicos', () => {
    it('un servicio nace inactivo y no se puede activar sin imagenes (409)', async () => {
      const s = await createInactiveService();
      expect(s.status).toBe(false);
      const act = await api
        .patch(`/services/status/${s.id}`, admin)
        .send({ status: true });
      expect(act.status).toBe(409);
    });

    it('el publico solo ve servicios activos, aunque pida status=INACTIVO; ADMIN si ve inactivos', async () => {
      const active = await createActiveService(api, admin);
      const inactive = await createInactiveService();

      const pub = await api.get(
        `/services?limit=100&search=${encodeURIComponent('Servicio ')}`,
      );
      expectStatus(pub, 200);
      const ids = pub.body.data.items.map((s: { id: number }) => s.id);
      expect(ids).toContain(active.id);
      expect(ids).not.toContain(inactive.id);

      const forced = await api.get('/services?status=INACTIVO&limit=100');
      expect(
        forced.body.data.items.map((s: { id: number }) => s.id),
      ).not.toContain(inactive.id);
      const asPatient = await api.get(
        '/services?status=INACTIVO&limit=100',
        patient.session,
      );
      expect(
        asPatient.body.data.items.map((s: { id: number }) => s.id),
      ).not.toContain(inactive.id);

      const adm = await api.get('/services?status=INACTIVO&limit=100', admin);
      expect(adm.body.data.items.map((s: { id: number }) => s.id)).toContain(
        inactive.id,
      );
      // la respuesta no expone nombres de archivo almacenados
      expect(JSON.stringify(pub.body)).not.toMatch(
        /[a-f0-9]{32}\.(png|jpg|webp)/,
      );
    });

    it('desactivar un servicio lo saca de la pagina publica y de sus imagenes', async () => {
      const s = await createActiveService(api, admin);
      const list = await api.get(`/services?limit=100`);
      const item = list.body.data.items.find(
        (x: { id: number }) => x.id === s.id,
      );
      expect(item.images.length).toBe(1);
      const imageUrl = item.images[0].url as string;
      expectStatus(await api.get(imageUrl), 200);

      expectStatus(
        await api
          .patch(`/services/status/${s.id}`, admin)
          .send({ status: false }),
        200,
      );
      const after = await api.get('/services?limit=100');
      expect(
        after.body.data.items.map((x: { id: number }) => x.id),
      ).not.toContain(s.id);
      expect((await api.get(imageUrl)).status).toBe(404);
      expectStatus(await api.get(imageUrl, admin), 200); // vista previa del admin
    });

    it('imagenes de servicio: sustituir y eliminar borran el archivo del disco; maximo 5', async () => {
      const s = await createInactiveService();
      const before = files('services').length;
      const up = await api
        .post(`/services/${s.id}/images`, admin)
        .attach('images', pngFile().buf, {
          filename: 'x.png',
          contentType: 'image/png',
        })
        .attach('images', pngFile().buf, {
          filename: 'y.png',
          contentType: 'image/png',
        });
      expectStatus(up, 201);
      expect(files('services').length).toBe(before + 2);
      const images = up.body.data.images as { id: number }[];

      // sustitucion: el archivo anterior se elimina
      const old = files('services');
      const rep = await api
        .put(`/services/${s.id}/images/${images[0].id}`, admin)
        .attach('image', pngFile().buf, {
          filename: 'n.png',
          contentType: 'image/png',
        });
      expectStatus(rep, 200);
      const afterReplace = files('services');
      expect(afterReplace.length).toBe(old.length);
      expect(afterReplace.filter((f) => !old.includes(f))).toHaveLength(1);

      // reemplazo con archivo invalido: nada cambia
      const bad = await api
        .put(`/services/${s.id}/images/${images[0].id}`, admin)
        .attach('image', Buffer.from('no soy imagen'), {
          filename: 'n.png',
          contentType: 'image/png',
        });
      expect(bad.status).toBe(400);
      expect(files('services').length).toBe(afterReplace.length);

      // eliminacion
      expectStatus(
        await api.delete(`/services/${s.id}/images/${images[1].id}`, admin),
        200,
      );
      expect(files('services').length).toBe(afterReplace.length - 1);

      // limite de 5
      const four = await api
        .post(`/services/${s.id}/images`, admin)
        .attach('images', pngFile().buf, {
          filename: '1.png',
          contentType: 'image/png',
        })
        .attach('images', pngFile().buf, {
          filename: '2.png',
          contentType: 'image/png',
        })
        .attach('images', pngFile().buf, {
          filename: '3.png',
          contentType: 'image/png',
        })
        .attach('images', pngFile().buf, {
          filename: '4.png',
          contentType: 'image/png',
        });
      expectStatus(four, 201); // ahora 1 + 4 = 5
      const sixth = await api
        .post(`/services/${s.id}/images`, admin)
        .attach('images', pngFile().buf, {
          filename: '6.png',
          contentType: 'image/png',
        });
      expect(sixth.status).toBe(400);
    });

    it('un nombre de servicio repetido se rechaza (API y UNIQUE en BD)', async () => {
      const s = await createInactiveService();
      const dup = await api.post('/services', admin).send({
        name: s.name,
        durationMinutes: 30,
        description: 'duplicado',
        price: 10,
      });
      expect([400, 409]).toContain(dup.status);
      const { rows } = await db().query(
        'SELECT count(*)::int AS n FROM services WHERE name = $1',
        [s.name],
      );
      expect(rows[0].n).toBe(1);
    });
  });

  describe('ofertas publicas', () => {
    it('solo salen activas y vigentes; las futuras, vencidas e inactivas no', async () => {
      const current = await api.post('/offers', admin).send(offerBody());
      const future = await api.post('/offers', admin).send(
        offerBody({
          start_date: new Date(Date.now() + 3 * DAY).toISOString(),
          end_date: new Date(Date.now() + 9 * DAY).toISOString(),
        }),
      );
      const inactive = await api
        .post('/offers', admin)
        .send(offerBody({ status: false }));
      const expired = await api.post('/offers', admin).send(offerBody());
      for (const r of [current, future, inactive, expired])
        expectStatus(r, 201);
      // una oferta que vence (la BD se manipula porque la API no permite crear vencidas)
      await db().query(
        'UPDATE offers SET start_date = $1, end_date = $2 WHERE id = $3',
        [
          new Date(Date.now() - 10 * DAY).toISOString(),
          new Date(Date.now() - 5 * DAY).toISOString(),
          expired.body.data.id,
        ],
      );

      const pub = await api.get('/offers?limit=100');
      expectStatus(pub, 200);
      const ids = pub.body.data.items.map((o: { id: number }) => o.id);
      expect(ids).toContain(current.body.data.id);
      for (const r of [future, inactive, expired]) {
        expect(ids).not.toContain(r.body.data.id);
      }
      // ignora status/date del cliente
      const forced = await api.get(
        '/offers?status=INACTIVO&date=2020-01-01&limit=100',
      );
      const forcedIds = forced.body.data.items.map((o: { id: number }) => o.id);
      expect(forcedIds).not.toContain(inactive.body.data.id);
      expect(forcedIds).not.toContain(expired.body.data.id);

      // el admin los ve todos
      const adm = await api.get('/offers/admin?limit=100', admin);
      const admIds = adm.body.data.items.map((o: { id: number }) => o.id);
      for (const r of [current, future, inactive, expired]) {
        expect(admIds).toContain(r.body.data.id);
      }
      // rutas de administracion protegidas
      expect((await api.get('/offers/admin')).status).toBe(401);
      expect((await api.get('/offers/admin', patient.session)).status).toBe(
        403,
      );
    });

    it('fechas invalidas: inicio posterior al fin, fin ya pasado, formato incorrecto -> 400', async () => {
      expect(
        (
          await api.post('/offers', admin).send(
            offerBody({
              start_date: new Date(Date.now() + 5 * DAY).toISOString(),
              end_date: new Date(Date.now() + 2 * DAY).toISOString(),
            }),
          )
        ).status,
      ).toBe(400);
      expect(
        (
          await api.post('/offers', admin).send(
            offerBody({
              start_date: new Date(Date.now() - 9 * DAY).toISOString(),
              end_date: new Date(Date.now() - 5 * DAY).toISOString(),
            }),
          )
        ).status,
      ).toBe(400);
      expect(
        (
          await api
            .post('/offers', admin)
            .send(offerBody({ start_date: 'manana' }))
        ).status,
      ).toBe(400);
    });

    it('no se asignan servicios inactivos ni inexistentes a una oferta', async () => {
      const inactive = await createInactiveService();
      const active = await createActiveService(api, admin);
      const bad = await api
        .post('/offers', admin)
        .send(offerBody({ serviceIds: [inactive.id] }));
      expect(bad.status).toBe(400);
      const missing = await api
        .post('/offers', admin)
        .send(offerBody({ serviceIds: [999999] }));
      expect(missing.status).toBe(400);
      const ok = await api
        .post('/offers', admin)
        .send(offerBody({ serviceIds: [active.id] }));
      expectStatus(ok, 201);
      // tampoco se agrega luego por PATCH
      const upd = await api
        .patch(`/offers/${ok.body.data.id}`, admin)
        .send({ serviceIds: [inactive.id] });
      expect(upd.status).toBe(400);
      const { rows } = await db().query(
        'SELECT service_id FROM services_offers WHERE offer_id = $1',
        [ok.body.data.id],
      );
      expect(rows.map((r) => r.service_id)).toEqual([active.id]);
    });

    it('imagen de oferta: publica solo si esta vigente; sustituir/eliminar/borrar la oferta limpia el disco', async () => {
      const offer = await api.post('/offers', admin).send(offerBody());
      expectStatus(offer, 201);
      const id = offer.body.data.id as number;
      const hidden = await api
        .post('/offers', admin)
        .send(offerBody({ status: false }));
      const hiddenId = hidden.body.data.id as number;
      const before = files('offers').length;

      const put = (offerId: number, buf = pngFile().buf) =>
        api.put(`/offers/${offerId}/image`, admin).attach('image', buf, {
          filename: 'o.png',
          contentType: 'image/png',
        });

      expectStatus(await put(id), 200);
      expectStatus(await put(hiddenId), 200);
      expect(files('offers').length).toBe(before + 2);

      // visibilidad publica
      expectStatus(await api.get(`/offers/${id}/image`), 200);
      expect((await api.get(`/offers/${hiddenId}/image`)).status).toBe(404);
      expectStatus(
        await api.get(`/offers/admin/${hiddenId}/image`, admin),
        200,
      );
      expect((await api.get(`/offers/admin/${hiddenId}/image`)).status).toBe(
        401,
      );

      // sustitucion: el numero de archivos no crece
      expectStatus(await put(id), 200);
      expect(files('offers').length).toBe(before + 2);
      // invalida: no cambia nada
      expect((await put(id, Buffer.from('no soy una imagen'))).status).toBe(
        400,
      );
      expect(files('offers').length).toBe(before + 2);

      // eliminar solo la imagen
      expectStatus(await api.delete(`/offers/${id}/image`, admin), 200);
      expect(files('offers').length).toBe(before + 1);
      expect((await api.get(`/offers/${id}/image`)).status).toBe(404);

      // borrar la oferta elimina su archivo
      expectStatus(await api.delete(`/offers/${hiddenId}`, admin), 200);
      expect(files('offers').length).toBe(before);
    });
  });

  describe('preguntas frecuentes', () => {
    it('el publico solo ve activas; CRUD solo ADMIN, con auditoria y filtros en servidor', async () => {
      const active = await api.post('/faq', admin).send({
        question: uniq('Pregunta activa '),
        response: 'Respuesta',
        status: true,
      });
      const inactive = await api.post('/faq', admin).send({
        question: uniq('Pregunta inactiva '),
        response: 'Respuesta',
        status: false,
      });
      expectStatus(active, 201);
      expectStatus(inactive, 201);

      const pub = await api.get('/faq?limit=100');
      const ids = pub.body.data.items.map((f: { id: number }) => f.id);
      expect(ids).toContain(active.body.data.id);
      expect(ids).not.toContain(inactive.body.data.id);
      const forced = await api.get('/faq?status=INACTIVO&limit=100');
      expect(
        forced.body.data.items.map((f: { id: number }) => f.id),
      ).not.toContain(inactive.body.data.id);

      // administracion
      expect((await api.get('/faq/admin')).status).toBe(401);
      expect((await api.get('/faq/admin', patient.session)).status).toBe(403);
      const adm = await api.get('/faq/admin?status=INACTIVO&limit=100', admin);
      const admIds = adm.body.data.items.map((f: { id: number }) => f.id);
      expect(admIds).toContain(inactive.body.data.id);
      expect(admIds).not.toContain(active.body.data.id);

      // activar la inactiva la publica; borrarla la retira
      expectStatus(
        await api
          .patch(`/faq/${inactive.body.data.id}/status`, admin)
          .send({ status: true }),
        200,
      );
      const pub2 = await api.get('/faq?limit=100');
      expect(pub2.body.data.items.map((f: { id: number }) => f.id)).toContain(
        inactive.body.data.id,
      );
      expectStatus(
        await api.delete(`/faq/${inactive.body.data.id}`, admin),
        200,
      );
      expect(
        (await api.get(`/faq/admin/${inactive.body.data.id}`, admin)).status,
      ).toBe(404);

      for (const m of ['post', 'patch', 'delete'] as const) {
        const url = m === 'post' ? '/faq' : `/faq/${active.body.data.id}`;
        expect((await api[m](url, patient.session).send({})).status).toBe(403);
      }
      const audit = await db().query(
        `SELECT action FROM audit_logs WHERE entity = 'FAQ' AND entity_id = $1 ORDER BY id`,
        [inactive.body.data.id],
      );
      expect(audit.rows.map((r) => r.action)).toEqual([
        'FAQ_CREATED',
        'FAQ_STATUS_CHANGED',
        'FAQ_DELETED',
      ]);
    });
  });

  describe('paginacion y filtros del servidor', () => {
    it('parametros de paginacion invalidos -> 400 en todos los listados', async () => {
      const urls = [
        ['/services', null],
        ['/offers', null],
        ['/faq', null],
        ['/users', admin],
        ['/appointments', admin],
        ['/audit-logs', admin],
        ['/notifications', admin],
        ['/patients', admin],
        ['/consultations', admin],
      ] as const;
      for (const [url, who] of urls) {
        for (const q of [
          'limit=101',
          'limit=0',
          'page=0',
          'limit=abc',
          'page=-1',
        ]) {
          const res = await api.get(`${url}?${q}`, who);
          expect([url, q, res.status]).toEqual([url, q, 400]);
        }
      }
    });

    it('usuarios: search, role, status y paginacion con total', async () => {
      const prefix = uniq('Paginado');
      const created: number[] = [];
      for (let i = 0; i < 3; i += 1) {
        const res = await api.post('/users', admin).send({
          name: 'Persona',
          lastname: `${prefix}${i}`,
          email: `${prefix}${i}@example.com`,
          phone: `55${String(30_000_000 + Math.floor(Math.random() * 9_000_000) + i).padStart(8, '0')}`,
          password: 'Contrasena-Segura-123',
          role: 'ASISTENTE',
        });
        expectStatus(res, 201);
        created.push(res.body.data.id);
      }
      const p1 = await api.get(`/users?search=${prefix}&limit=2&page=1`, admin);
      const p2 = await api.get(`/users?search=${prefix}&limit=2&page=2`, admin);
      expect(p1.body.data.total).toBe(3);
      expect(p1.body.data.items).toHaveLength(2);
      expect(p2.body.data.items).toHaveLength(1);
      expect(p2.body.data.page).toBe(2);
      const all = [...p1.body.data.items, ...p2.body.data.items].map(
        (u: { id: number }) => u.id,
      );
      expect(new Set(all)).toEqual(new Set(created));
      // sin contrasenas en la respuesta
      expect(JSON.stringify(p1.body)).not.toMatch(/password|\$2[aby]\$/i);

      const byRole = await api.get(
        `/users?search=${prefix}&role=PACIENTE`,
        admin,
      );
      expect(byRole.body.data.total).toBe(0);
      const byRoleOk = await api.get(
        `/users?search=${prefix}&role=ASISTENTE`,
        admin,
      );
      expect(byRoleOk.body.data.total).toBe(3);

      expectStatus(
        await api
          .patch(`/users/status/${created[0]}`, admin)
          .send({ estado: false }),
        200,
      );
      const inactive = await api.get(
        `/users?search=${prefix}&status=INACTIVO`,
        admin,
      );
      expect(inactive.body.data.total).toBe(1);
      const active = await api.get(
        `/users?search=${prefix}&status=ACTIVO`,
        admin,
      );
      expect(active.body.data.total).toBe(2);
      expect((await api.get('/users?role=SUPERUSUARIO', admin)).status).toBe(
        400,
      );
    });

    it('citas: filtros por estado, rango de fechas, paciente y orden con paginacion', async () => {
      const staff = await createStaff(api, admin, 'ASISTENTE');
      const service = await createActiveService(api, admin, 30);
      const mine = await registerPatient(api);
      const base = Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate() + 200,
        15,
      );
      const ids: number[] = [];
      for (let i = 0; i < 3; i += 1) {
        const res = await api.post('/appointments', mine.session).send({
          scheduled_at: new Date(base + i * 2 * DAY).toISOString(),
          notes: 'filtro',
          service_id: service.id,
        });
        expectStatus(res, 201);
        ids.push(res.body.data.id);
      }
      expectStatus(
        await api.patch(`/appointments/${ids[0]}/confirm`, admin),
        200,
      );

      const asc = await api.get(
        `/appointments?patient_id=${mine.patientId}&sort=asc&limit=2&page=1`,
        admin,
      );
      expect(asc.body.data.total).toBe(3);
      expect(asc.body.data.items.map((a: { id: number }) => a.id)).toEqual([
        ids[0],
        ids[1],
      ]);
      const desc = await api.get(
        `/appointments?patient_id=${mine.patientId}&sort=desc&limit=2&page=2`,
        admin,
      );
      expect(desc.body.data.items.map((a: { id: number }) => a.id)).toEqual([
        ids[0],
      ]);

      const confirmed = await api.get(
        `/appointments?patient_id=${mine.patientId}&status=CONFIRMADA`,
        admin,
      );
      expect(confirmed.body.data.total).toBe(1);
      const lower = await api.get(
        `/appointments?patient_id=${mine.patientId}&status=pendiente`,
        admin,
      );
      expect(lower.body.data.total).toBe(2);

      const day = new Date(base + 2 * DAY).toISOString().slice(0, 10);
      const ranged = await api.get(
        `/appointments?patient_id=${mine.patientId}&from=${day}&to=${day}`,
        admin,
      );
      expect(ranged.body.data.items.map((a: { id: number }) => a.id)).toEqual([
        ids[1],
      ]);

      expect(
        (await api.get('/appointments?status=INVENTADO', admin)).status,
      ).toBe(400);
      expect((await api.get('/appointments?from=ayer', admin)).status).toBe(
        400,
      );
      expect((await api.get('/appointments?sort=up', admin)).status).toBe(400);

      // el paciente solo ve las suyas; el asistente ve todas las del paciente
      const own = await api.get('/appointments?limit=100', mine.session);
      expect(own.body.data.total).toBe(3);
      const byAssistant = await api.get(
        `/appointments?patient_id=${mine.patientId}`,
        staff.session,
      );
      expect(byAssistant.body.data.total).toBe(3);
    });

    it('notificaciones: filtro read, conteo de no leidas y paginacion', async () => {
      const service = await createActiveService(api, admin, 30);
      const mine = await registerPatient(api);
      const t = Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate() + 250,
        15,
      );
      for (let i = 0; i < 3; i += 1) {
        const a = await api.post('/appointments', admin).send({
          scheduled_at: new Date(t + i * DAY).toISOString(),
          notes: 'n',
          service_id: service.id,
          patient_id: mine.patientId,
        });
        expectStatus(a, 201);
        expectStatus(
          await api.patch(`/appointments/${a.body.data.id}/confirm`, admin),
          200,
        );
      }
      const all = await api.get('/notifications?limit=2', mine.session);
      expect(all.body.data.total).toBe(3);
      expect(all.body.data.items).toHaveLength(2);
      const unread = await api.get('/notifications/unread-count', mine.session);
      expect(JSON.stringify(unread.body.data)).toMatch(/3/);

      const first = all.body.data.items[0].id as number;
      expectStatus(
        await api.patch(`/notifications/${first}/read`, mine.session),
        200,
      );
      const readOnly = await api.get('/notifications?read=true', mine.session);
      expect(readOnly.body.data.total).toBe(1);
      const unreadOnly = await api.get(
        '/notifications?read=false',
        mine.session,
      );
      expect(unreadOnly.body.data.total).toBe(2);
      expect(
        (await api.get('/notifications?read=quizas', mine.session)).status,
      ).toBe(400);
    });
  });
});
