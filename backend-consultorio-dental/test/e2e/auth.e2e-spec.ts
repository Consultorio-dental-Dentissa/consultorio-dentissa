import type { INestApplication } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import {
  Http,
  Session,
  closeDb,
  cookieHeader,
  cookiesFrom,
  createApp,
  db,
  http,
} from './support/app';
import {
  PASSWORD,
  expectStatus,
  login,
  loginAdmin,
  patientPayload,
  registerPatient,
  sleep,
  uniq,
  uniquePhone,
} from './support/factory';

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

/** Spec 01 (auth) y spec 06: registro, sesiones, contrasenas y rate limit. */
describe('Autenticacion y sesiones (e2e)', () => {
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

  const refreshRows = async (userId: number) =>
    (
      await db().query(
        'SELECT revoked_at FROM refresh_tokens WHERE user_id = $1',
        [userId],
      )
    ).rows as { revoked_at: Date | null }[];

  describe('registro publico', () => {
    it('contrasena de menos de 10 caracteres -> 400; con 10 -> 201', async () => {
      const short = await api
        .post('/auth/register')
        .send(patientPayload({ password: 'Corta-123' })); // 9
      expect(short.status).toBe(400);
      const ok = await api
        .post('/auth/register')
        .send(patientPayload({ password: 'Exacta-123' })); // 10
      expectStatus(ok, 201);
    });

    it('telefono de 9 digitos y de 16 -> 400; de 10 y de 15 -> 201', async () => {
      expect(
        (
          await api
            .post('/auth/register')
            .send(patientPayload({ phone: '123456789' }))
        ).status,
      ).toBe(400);
      expect(
        (
          await api
            .post('/auth/register')
            .send(patientPayload({ phone: '1234567890123456' }))
        ).status,
      ).toBe(400);
      expectStatus(
        await api.post('/auth/register').send(patientPayload()),
        201,
      );
      expectStatus(
        await api.post('/auth/register').send(
          patientPayload({
            phone: `52${uniquePhone()}XX`.slice(0, 15).replace(/X/g, '1'),
          }),
        ),
        201,
      );
    });

    it('correo repetido y telefono repetido -> 400 con mensaje (no se crea el duplicado)', async () => {
      const first = patientPayload();
      expectStatus(await api.post('/auth/register').send(first), 201);
      const sameEmail = await api
        .post('/auth/register')
        .send(patientPayload({ email: first.email }));
      expect(sameEmail.status).toBe(400);
      expect(sameEmail.body.message).toMatch(/correo/i);
      const samePhone = await api
        .post('/auth/register')
        .send(patientPayload({ phone: first.phone }));
      expect(samePhone.status).toBe(400);
      expect(samePhone.body.message).toMatch(/tel[eé]fono/i);
    });

    it('la respuesta nunca incluye la contrasena ni su hash', async () => {
      const res = await api.post('/auth/register').send(patientPayload());
      expectStatus(res, 201);
      expect(JSON.stringify(res.body)).not.toMatch(/password|\$2[aby]\$/i);
    });
  });

  describe('login', () => {
    it('credenciales incorrectas y correo inexistente -> 401 con el mismo mensaje', async () => {
      const p = await registerPatient(api);
      const badPass = await api
        .post('/auth/login')
        .send({ email: p.email, password: 'otra-contrasena-1' });
      const unknown = await api
        .post('/auth/login')
        .send({ email: `${uniq('nadie')}@example.com`, password: PASSWORD });
      expect(badPass.status).toBe(401);
      expect(unknown.status).toBe(401);
      expect(badPass.body.message).toBe(unknown.body.message);
      expect(cookiesFrom(badPass).access).toBe('');
    });

    it('login correcto fija cookies HttpOnly y no devuelve tokens en el cuerpo', async () => {
      const p = await registerPatient(api);
      const res = await api
        .post('/auth/login')
        .send({ email: p.email, password: p.password });
      expectStatus(res, 201);
      const raw = (res.headers['set-cookie'] ?? []) as string[];
      const access = raw.find((c) => c.startsWith('access_token='))!;
      const refresh = raw.find((c) => c.startsWith('refresh_token='))!;
      expect(access).toMatch(/HttpOnly/i);
      expect(refresh).toMatch(/HttpOnly/i);
      expect(refresh).toMatch(/Path=\/auth/i);
      const { access: a, refresh: r } = cookiesFrom(res);
      expect(JSON.stringify(res.body)).not.toContain(a);
      expect(JSON.stringify(res.body)).not.toContain(r);
    });

    it('/auth/me exige sesion y devuelve el perfil propio', async () => {
      const p = await registerPatient(api);
      expect((await api.get('/auth/me')).status).toBe(401);
      const me = await api.get('/auth/me', p.session);
      expectStatus(me, 200);
      expect(me.body.data.email).toBe(p.email);
      expect(me.body.data.role).toBe('PACIENTE');
    });
  });

  describe('refresh con rotacion y deteccion de reutilizacion', () => {
    const refresh = (cookie: string) =>
      api.post('/auth/refresh').set('Cookie', cookie);

    it('rota el refresh token: el nuevo funciona y el anterior queda revocado', async () => {
      const p = await registerPatient(api);
      const res = await refresh(`refresh_token=${p.session.refresh}`);
      expectStatus(res, 201);
      const next = cookiesFrom(res);
      expect(next.refresh).toBeTruthy();
      expect(next.refresh).not.toBe(p.session.refresh);
      expect(next.access).toBeTruthy();

      // El token nuevo emite otra sesion valida
      const ok = await refresh(`refresh_token=${next.refresh}`);
      expectStatus(ok, 201);
    });

    it('reutilizar un refresh token ya rotado -> 401 y revoca TODAS las sesiones del usuario', async () => {
      const p = await registerPatient(api);
      const second = await login(api, p.email, p.password); // 2a sesion
      const rotated = await refresh(`refresh_token=${p.session.refresh}`);
      expectStatus(rotated, 201);
      const newest = cookiesFrom(rotated).refresh;

      // reuso del token viejo (robo)
      const reuse = await refresh(`refresh_token=${p.session.refresh}`);
      expect(reuse.status).toBe(401);

      // ni el token rotado mas reciente ni la otra sesion sirven ya
      expect((await refresh(`refresh_token=${newest}`)).status).toBe(401);
      expect((await refresh(`refresh_token=${second.refresh}`)).status).toBe(
        401,
      );
      const rows = await refreshRows(p.userId);
      expect(rows.length).toBeGreaterThanOrEqual(3);
      expect(rows.every((r) => r.revoked_at !== null)).toBe(true);
    });

    it('sin cookie, con token inventado o vencido -> 401', async () => {
      expect((await api.post('/auth/refresh')).status).toBe(401);
      expect(
        (await refresh(`refresh_token=${randomBytes(64).toString('hex')}`))
          .status,
      ).toBe(401);

      const p = await registerPatient(api);
      await db().query(
        `UPDATE refresh_tokens SET expires_at = now() - interval '1 hour' WHERE token_hash = $1`,
        [sha256(p.session.refresh)],
      );
      expect((await refresh(`refresh_token=${p.session.refresh}`)).status).toBe(
        401,
      );
    });

    it('en BD solo se guarda el hash del refresh token, no el valor', async () => {
      const p = await registerPatient(api);
      const { rows } = await db().query(
        'SELECT token_hash FROM refresh_tokens WHERE user_id = $1',
        [p.userId],
      );
      expect(rows.map((r) => r.token_hash)).toContain(
        sha256(p.session.refresh),
      );
      expect(rows.map((r) => r.token_hash)).not.toContain(p.session.refresh);
    });
  });

  describe('logout', () => {
    it('revoca el refresh token y limpia las cookies', async () => {
      const p = await registerPatient(api);
      const res = await api.delete('/auth/logout', p.session);
      expectStatus(res, 200);
      const cleared = ((res.headers['set-cookie'] ?? []) as string[]).join(';');
      expect(cleared).toMatch(/access_token=;/);
      expect(cleared).toMatch(/refresh_token=;/);

      const rows = await refreshRows(p.userId);
      expect(rows.every((r) => r.revoked_at !== null)).toBe(true);
      const again = await api
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${p.session.refresh}`);
      expect(again.status).toBe(401);
    });
  });

  describe('cambio de contrasena', () => {
    it('exige la actual, rechaza igual/corta y al cambiar revoca sesiones y access tokens previos', async () => {
      const p = await registerPatient(api);
      const other = await login(api, p.email, p.password); // otra sesion
      await sleep(1100); // el access token se compara por segundo (iat)
      const next = 'Nueva-Contrasena-456';

      const wrong = await api
        .patch('/auth/password', p.session)
        .send({ currentPassword: 'incorrecta-123', newPassword: next });
      expect(wrong.status).toBe(400);
      const same = await api
        .patch('/auth/password', p.session)
        .send({ currentPassword: p.password, newPassword: p.password });
      expect(same.status).toBe(400);
      const short = await api
        .patch('/auth/password', p.session)
        .send({ currentPassword: p.password, newPassword: 'corta' });
      expect(short.status).toBe(400);
      expect((await api.get('/auth/me', p.session)).status).toBe(200);

      const ok = await api
        .patch('/auth/password', p.session)
        .send({ currentPassword: p.password, newPassword: next });
      expectStatus(ok, 200);

      // sesiones previas: access token y refresh tokens dejan de servir
      expect((await api.get('/auth/me', p.session)).status).toBe(401);
      expect((await api.get('/auth/me', other)).status).toBe(401);
      for (const s of [p.session, other]) {
        const r = await api
          .post('/auth/refresh')
          .set('Cookie', `refresh_token=${s.refresh}`);
        expect(r.status).toBe(401);
      }
      expect(
        (
          await api
            .post('/auth/login')
            .send({ email: p.email, password: p.password })
        ).status,
      ).toBe(401);
      const fresh = await login(api, p.email, next);
      expect((await api.get('/auth/me', fresh)).status).toBe(200);

      const audit = await db().query(
        `SELECT action, before, after FROM audit_logs
         WHERE action = 'PASSWORD_CHANGED' AND entity_id = $1`,
        [p.userId],
      );
      expect(audit.rowCount).toBe(1);
      expect(JSON.stringify(audit.rows[0])).not.toMatch(
        new RegExp(`${next}|${p.password}|\\$2[aby]\\$`),
      );
    });

    it('sin sesion -> 401', async () => {
      const res = await api
        .patch('/auth/password')
        .send({ currentPassword: PASSWORD, newPassword: 'Otra-Larga-123456' });
      expect(res.status).toBe(401);
    });
  });

  describe('recuperacion de contrasena sin SMTP', () => {
    it('forgot-password responde 503 igual exista o no el correo (no simula exito)', async () => {
      const p = await registerPatient(api);
      const known = await api
        .post('/auth/forgot-password')
        .send({ email: p.email });
      const unknown = await api
        .post('/auth/forgot-password')
        .send({ email: `${uniq('nadie')}@example.com` });
      expect(known.status).toBe(503);
      expect(unknown.status).toBe(503);
      expect(known.body.message).toBe(unknown.body.message);
      const { rowCount } = await db().query(
        'SELECT 1 FROM password_reset_tokens WHERE user_id = $1',
        [p.userId],
      );
      expect(rowCount).toBe(0);
    });
  });

  describe('reset-password con token (hash insertado en la BD de pruebas)', () => {
    const insertToken = async (
      userId: number,
      opts: { expiresInMs?: number; used?: boolean } = {},
    ) => {
      const token = randomBytes(32).toString('hex');
      await db().query(
        `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, used_at)
         VALUES ($1, $2, $3, $4)`,
        [
          sha256(token),
          userId,
          new Date(Date.now() + (opts.expiresInMs ?? 600_000)).toISOString(),
          opts.used ? new Date().toISOString() : null,
        ],
      );
      return token;
    };

    it('token valido: cambia la contrasena, se consume, revoca sesiones y audita sin secretos', async () => {
      const p = await registerPatient(api);
      const token = await insertToken(p.userId);
      const next = 'Restablecida-789';

      const weak = await api
        .post('/auth/reset-password')
        .send({ token, newPassword: 'corta' });
      expect(weak.status).toBe(400);

      const ok = await api
        .post('/auth/reset-password')
        .send({ token, newPassword: next });
      expectStatus(ok, 201);

      expect(
        (
          await api
            .post('/auth/login')
            .send({ email: p.email, password: p.password })
        ).status,
      ).toBe(401);
      await login(api, p.email, next);
      const r = await api
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${p.session.refresh}`);
      expect(r.status).toBe(401);

      // un segundo uso del mismo token falla
      const reuse = await api
        .post('/auth/reset-password')
        .send({ token, newPassword: 'Otra-Contrasena-000' });
      expect(reuse.status).toBe(400);

      const audit = await db().query(
        `SELECT before, after FROM audit_logs WHERE action = 'PASSWORD_RESET' AND entity_id = $1`,
        [p.userId],
      );
      expect(audit.rowCount).toBe(1);
      expect(JSON.stringify(audit.rows[0])).not.toContain(token);
      expect(JSON.stringify(audit.rows[0])).not.toContain(next);
    });

    it('token expirado, usado o inexistente -> 400 y la contrasena no cambia', async () => {
      const p = await registerPatient(api);
      const expired = await insertToken(p.userId, { expiresInMs: -60_000 });
      const used = await insertToken(p.userId, { used: true });
      for (const token of [expired, used, randomBytes(32).toString('hex')]) {
        const res = await api
          .post('/auth/reset-password')
          .send({ token, newPassword: 'Nueva-Valida-123456' });
        expect(res.status).toBe(400);
      }
      await login(api, p.email, p.password); // sigue funcionando la original
    });

    it('un usuario desactivado no puede restablecer su contrasena', async () => {
      const p = await registerPatient(api);
      const token = await insertToken(p.userId);
      expectStatus(
        await api
          .patch(`/users/status/${p.userId}`, admin)
          .send({ estado: false }),
        200,
      );
      const res = await api
        .post('/auth/reset-password')
        .send({ token, newPassword: 'Nueva-Valida-123456' });
      expect(res.status).toBe(400);
    });

    it('un usuario desactivado pierde el acceso: login, sesion y refresh -> 401', async () => {
      const p = await registerPatient(api);
      expectStatus(
        await api
          .patch(`/users/status/${p.userId}`, admin)
          .send({ estado: false }),
        200,
      );
      expect((await api.get('/auth/me', p.session)).status).toBe(401);
      expect(
        (
          await api
            .post('/auth/login')
            .send({ email: p.email, password: p.password })
        ).status,
      ).toBe(401);
      const r = await api
        .post('/auth/refresh')
        .set('Cookie', cookieHeader('', p.session.refresh));
      expect(r.status).toBe(401);
    });
  });

  describe('rate limit (429)', () => {
    it('login: la peticion 11 desde la misma IP en un minuto -> 429', async () => {
      const ip = '10.201.0.1';
      const email = `${uniq('rl')}@example.com`;
      const statuses: number[] = [];
      for (let i = 0; i < 11; i += 1) {
        const res = await api
          .post('/auth/login', null, ip)
          .send({ email, password: 'cualquiera-123' });
        statuses.push(res.status);
      }
      expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
      expect(statuses[10]).toBe(429);
      // otra IP no se ve afectada
      const other = await api
        .post('/auth/login', null, '10.201.0.2')
        .send({ email, password: 'cualquiera-123' });
      expect(other.status).toBe(401);
    });

    it('registro: la peticion 6 desde la misma IP en un minuto -> 429', async () => {
      const ip = '10.201.0.3';
      const statuses: number[] = [];
      for (let i = 0; i < 6; i += 1) {
        const res = await api
          .post('/auth/register', null, ip)
          .send(patientPayload());
        statuses.push(res.status);
      }
      expect(statuses.slice(0, 5).every((s) => s === 201)).toBe(true);
      expect(statuses[5]).toBe(429);
    });

    it('forgot-password: la peticion 6 desde la misma IP -> 429', async () => {
      const ip = '10.201.0.4';
      const statuses: number[] = [];
      for (let i = 0; i < 6; i += 1) {
        const res = await api
          .post('/auth/forgot-password', null, ip)
          .send({ email: 'x@example.com' });
        statuses.push(res.status);
      }
      expect(statuses[5]).toBe(429);
    });
  });
});

/** Con SMTP "configurado" (mock del MailService): misma respuesta exista o no el correo. */
describe('Recuperacion de contrasena con SMTP simulado (e2e)', () => {
  let app: INestApplication;
  let api: Http;
  const sent: { to: string; token: string }[] = [];

  beforeAll(async () => {
    app = await createApp({
      mail: {
        isConfigured: () => true,
        sendPasswordResetEmail: (to: string, _name: string, token: string) => {
          sent.push({ to, token });
          return Promise.resolve(true);
        },
      },
    });
    api = http(app);
  }, 120000);

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  it('misma respuesta 2xx para correo existente e inexistente; solo el existente genera token (hash en BD)', async () => {
    const p = await registerPatient(api);
    const known = await api
      .post('/auth/forgot-password')
      .send({ email: p.email });
    const unknown = await api
      .post('/auth/forgot-password')
      .send({ email: `${uniq('nadie')}@example.com` });
    expect(known.status).toBe(unknown.status);
    expect(known.status).toBeLessThan(300);
    expect(known.body).toEqual(unknown.body);

    await sleep(100); // el envio no se espera
    expect(sent.filter((s) => s.to === p.email)).toHaveLength(1);
    const { token } = sent.find((s) => s.to === p.email)!;
    const rows = await db().query(
      'SELECT token_hash FROM password_reset_tokens WHERE user_id = $1',
      [p.userId],
    );
    expect(rows.rowCount).toBe(1);
    expect(rows.rows[0].token_hash).toBe(sha256(token));
    expect(rows.rows[0].token_hash).not.toBe(token);

    // flujo completo con el token "enviado por correo"
    const next = 'Por-Correo-123456';
    expectStatus(
      await api.post('/auth/reset-password').send({ token, newPassword: next }),
      201,
    );
    await login(api, p.email, next);
  });

  it('solicitar otro enlace invalida el anterior (solo un token vigente)', async () => {
    const p = await registerPatient(api);
    await api.post('/auth/forgot-password').send({ email: p.email });
    await api.post('/auth/forgot-password').send({ email: p.email });
    await sleep(100);
    const tokens = sent.filter((s) => s.to === p.email);
    expect(tokens).toHaveLength(2);
    const first = await api
      .post('/auth/reset-password')
      .send({ token: tokens[0].token, newPassword: 'Nueva-Valida-123456' });
    expect(first.status).toBe(400);
    const second = await api
      .post('/auth/reset-password')
      .send({ token: tokens[1].token, newPassword: 'Nueva-Valida-123456' });
    expectStatus(second, 201);
  });
});
