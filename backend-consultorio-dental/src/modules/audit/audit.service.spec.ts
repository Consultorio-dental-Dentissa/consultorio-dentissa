import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Prisma } from '@prisma/client';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { sanitizeAuditData } from './audit-sanitize';
import { ROLES_KEY } from 'src/infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

describe('sanitizeAuditData', () => {
  it('elimina contrasenas, tokens y texto clinico en cualquier nivel', () => {
    const result = sanitizeAuditData({
      status: true,
      password: 'secreto',
      newPassword: 'x',
      passwordHash: 'h',
      refresh_token: 't',
      nested: { accessToken: 'a', ok: 1, notes: 'clinico' },
      observations: 'clinico',
      list: [{ token: 'z', id: 3 }],
    });

    expect(JSON.stringify(result)).not.toMatch(
      /secreto|refresh_token|accessToken|clinico|"token"/,
    );
    expect(result.status).toBe(true);
    expect(result.nested).toEqual({ ok: 1 });
    expect(result.list).toEqual([{ id: 3 }]);
  });

  it('serializa fechas y decimales y recorta textos largos', () => {
    const date = new Date('2030-01-01T00:00:00.000Z');
    const result = sanitizeAuditData({
      when: date,
      price: new Prisma.Decimal('12.50'),
      title: 'a'.repeat(500),
    });

    expect(result.when).toBe(date.toISOString());
    expect(result.price).toBe('12.5');
    expect((result.title as string).length).toBeLessThan(310);
  });
});

describe('AuditService', () => {
  let prisma: any;
  let service: AuditService;

  beforeEach(() => {
    prisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    service = new AuditService(prisma);
  });

  it('log usa el cliente de la transaccion y minimiza before/after', async () => {
    const txClient = {
      auditLog: { create: jest.fn().mockResolvedValue({ id: 2 }) },
    };

    await service.log(
      {
        userId: 4,
        action: 'X',
        entity: 'USER',
        entityId: 9,
        before: { status: true, password: 'p' },
        after: { token: 't', status: false },
      },
      txClient as any,
    );

    expect(prisma.auditLog.create).not.toHaveBeenCalled();
    const data = txClient.auditLog.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ user_id: 4, entity_id: 9 });
    expect(data.before).toEqual({ status: true });
    expect(data.after).toEqual({ status: false });
  });

  it('findAll combina filtros y pagina en servidor', async () => {
    prisma.auditLog.count.mockResolvedValue(45);
    const result = await service.findAll({
      action: 'USER_CREATED',
      entity: 'USER',
      userId: 3,
      from: '2030-01-01T00:00:00Z',
      to: '2030-02-01T00:00:00Z',
      page: 2,
      limit: 10,
    });

    const args = prisma.auditLog.findMany.mock.calls[0][0];
    expect(args.where).toMatchObject({
      action: 'USER_CREATED',
      entity: 'USER',
      user_id: 3,
    });
    expect(args.where.created_at.gte).toEqual(new Date('2030-01-01T00:00:00Z'));
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
    expect(result).toMatchObject({ total: 45, page: 2, limit: 10 });
  });

  it('`to` solo-dia incluye todo ese dia local y `from` solo-dia empieza a las 00:00 locales', async () => {
    await service.findAll({ from: '2030-03-10', to: '2030-03-10' });
    const { gte, lte } =
      prisma.auditLog.findMany.mock.calls[0][0].where.created_at;
    expect(lte.getTime() - gte.getTime()).toBe(24 * 3600_000 - 1);
  });

  it('from > to responde 400 y no consulta', async () => {
    await expect(
      service.findAll({ from: '2030-03-11', to: '2030-03-10' }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.auditLog.findMany).not.toHaveBeenCalled();
  });

  it('el servicio es append-only: no expone update ni delete', () => {
    const methods = Object.getOwnPropertyNames(AuditService.prototype);
    expect(methods.sort()).toEqual(['constructor', 'findAll', 'log']);
  });

  it('el endpoint es solo para ADMINISTRADOR y solo lectura', () => {
    expect(Reflect.getMetadata(ROLES_KEY, AuditController)).toEqual([
      Role.ADMINISTRADOR,
    ]);
    expect(Object.getOwnPropertyNames(AuditController.prototype)).toEqual([
      'constructor',
      'get',
    ]);
  });
});

describe('GetAuditLogsDto - fechas', () => {
  const errors = (q: object) =>
    validateSync(plainToInstance(GetAuditLogsDto, q)).length;

  it('acepta AAAA-MM-DD reales y fecha-hora con zona', () => {
    expect(
      errors({ from: '2030-02-28', to: '2030-03-01T10:00:00-06:00' }),
    ).toBe(0);
    expect(errors({ from: '2030-02-28T10:00:00Z' })).toBe(0);
  });

  it('rechaza fechas imposibles, sin zona o en otro formato', () => {
    for (const bad of [
      '2026-13-45',
      '2026-02-30',
      '2026-01-01T10:00:00',
      '2026-1-1',
      '01/02/2026',
      '2026-01-01T25:00:00Z',
    ]) {
      expect(errors({ from: bad })).toBeGreaterThan(0);
      expect(errors({ to: bad })).toBeGreaterThan(0);
    }
  });
});
