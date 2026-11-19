import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OffersService, parseOfferDate } from './offers.service';
import { OffersController } from './offers.controller';
import { ROLES_KEY } from 'src/infrastructure/security/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from 'src/infrastructure/security/decorators/public.decorator';
import { Role } from '../users/enums/rol.enum';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateOfferDto, GetOffersDto } from './dto/offer.dto';

describe('OffersService', () => {
  const tx = { marker: 'tx' };
  const offerRow = (extra: object = {}) => ({
    id: 1,
    name: 'Oferta',
    description: 'd',
    start_date: new Date('2030-01-10T06:00:00Z'),
    end_date: new Date('2030-01-20T05:59:59Z'),
    status: true,
    services: [{ service: { id: 3, name: 'S', status: true } }],
    ...extra,
  });
  let repo: any;
  let audit: any;
  let prisma: any;
  let service: OffersService;

  beforeEach(() => {
    repo = {
      getAllPublic: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getAllAdmin: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getById: jest.fn().mockResolvedValue(offerRow()),
      countActiveServices: jest.fn().mockResolvedValue(1),
      lockById: jest.fn(),
      create: jest.fn().mockImplementation(async () => offerRow()),
      update: jest.fn().mockImplementation(async () => offerRow()),
      delete: jest.fn(),
    };
    audit = { log: jest.fn() };
    prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new OffersService(repo, prisma, audit, {
      remove: jest.fn(),
      removeMany: jest.fn(),
      save: jest.fn(),
    } as any);
  });

  describe('listado publico', () => {
    it('solo activas y vigentes hoy, ignorando status/date del cliente', async () => {
      await service.getPublic({ status: false, date: '2000-01-01' } as any);
      const filters = repo.getAllPublic.mock.calls[0][0];
      expect(filters.status).toBe(true);
      expect(filters.validDay).toBeUndefined();
      // instante actual (no el dia): una oferta que termino hoy a las 00:00 ya no sale
      expect(Math.abs(filters.activeAt.getTime() - Date.now())).toBeLessThan(
        5000,
      );
    });

    it('aplana los servicios de la oferta', async () => {
      repo.getAllPublic.mockResolvedValue({
        items: [offerRow()],
        total: 1,
      });
      const result = await service.getPublic({});
      expect(result.items[0].services).toEqual([
        { id: 3, name: 'S', status: true },
      ]);
    });
  });

  describe('listado admin', () => {
    it('respeta status y convierte date en la ventana del dia local', async () => {
      await service.getAdmin({ status: false, date: '2030-03-15' });
      const filters = repo.getAllAdmin.mock.calls[0][0];
      expect(filters.status).toBe(false);
      expect(
        filters.validDay.end.getTime() - filters.validDay.start.getTime(),
      ).toBe(24 * 3600_000);
    });

    it('sin date no filtra por vigencia', async () => {
      await service.getAdmin({});
      expect(repo.getAllAdmin.mock.calls[0][0].validDay).toBeUndefined();
    });
  });

  describe('fechas', () => {
    it('una fecha sin hora cubre el dia local completo (inicio 00:00, fin 23:59:59.999)', () => {
      const start = parseOfferDate('2030-01-10', 'start');
      const end = parseOfferDate('2030-01-10', 'end');
      expect(end.getTime() - start.getTime()).toBe(24 * 3600_000 - 1);
    });

    it('una fecha-hora ISO se respeta tal cual', () => {
      expect(parseOfferDate('2030-01-10T10:00:00Z', 'end').toISOString()).toBe(
        '2030-01-10T10:00:00.000Z',
      );
    });

    it('rechaza formatos ambiguos o fechas imposibles', () => {
      for (const bad of [
        '2026-13-45',
        '2026-02-30',
        '2026-01-01T10:00:00',
        '2026-01-01 10:00:00',
        '01/02/2026',
        '2026-1-1',
        'manana',
      ]) {
        expect(() => parseOfferDate(bad, 'start')).toThrow(BadRequestException);
      }
      expect(
        parseOfferDate('2030-01-10T10:00:00-06:00', 'start').toISOString(),
      ).toBe('2030-01-10T16:00:00.000Z');
    });

    it('rechaza start > end al crear', async () => {
      await expect(
        service.create(
          {
            name: 'x',
            description: 'd',
            start_date: '2031-02-01',
            end_date: '2031-01-01',
            status: true,
          },
          1,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(repo.create).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });

    it('acepta start == end (mismo dia)', async () => {
      await expect(
        service.create(
          {
            name: 'x',
            description: 'd',
            start_date: '2031-02-01',
            end_date: '2031-02-01',
            status: true,
          },
          1,
        ),
      ).resolves.toBeDefined();
    });

    it('rechaza crear una oferta que ya termino', async () => {
      await expect(
        service.create(
          {
            name: 'x',
            description: 'd',
            start_date: '2000-01-01',
            end_date: '2000-01-02',
            status: true,
          },
          1,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('al actualizar valida contra la fecha existente cuando solo llega una', async () => {
      // start actual 2030-01-10; nuevo end anterior => invalido
      await expect(
        service.update(1, { end_date: '2030-01-01' }, 1),
      ).rejects.toThrow(BadRequestException);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('servicios relacionados', () => {
    it('rechaza servicios inexistentes', async () => {
      repo.countActiveServices.mockResolvedValue(1);
      await expect(
        service.create(
          {
            name: 'x',
            description: 'd',
            start_date: '2031-02-01',
            end_date: '2031-02-02',
            serviceIds: [1, 2],
            status: true,
          },
          1,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('el mensaje indica servicios inexistentes o inactivos', async () => {
      repo.countActiveServices.mockResolvedValue(0);
      await expect(
        service.create(
          {
            name: 'x',
            description: 'd',
            start_date: '2031-02-01',
            end_date: '2031-02-02',
            serviceIds: [1],
            status: true,
          },
          1,
        ),
      ).rejects.toThrow('inactivo');
    });

    it('crea con servicios y audita en la misma transaccion', async () => {
      await service.create(
        {
          name: ' Oferta ',
          description: 'd',
          start_date: '2031-02-01',
          end_date: '2031-02-02',
          serviceIds: [3],
          status: true,
        },
        7,
      );
      expect(repo.create.mock.calls[0][0].name).toBe('Oferta');
      expect(repo.create.mock.calls[0][0].serviceIds).toEqual([3]);
      expect(repo.create.mock.calls[0][1]).toBe(tx);
      expect(audit.log.mock.calls[0][0]).toMatchObject({
        action: 'OFFER_CREATED',
        userId: 7,
      });
      expect(audit.log.mock.calls[0][1]).toBe(tx);
    });
  });

  describe('actualizacion', () => {
    it('body vacio responde 400', async () => {
      await expect(service.update(1, {}, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('sin cambios reales no escribe ni audita', async () => {
      await service.update(
        1,
        { name: ' Oferta ', description: 'd', serviceIds: [3] },
        1,
      );
      expect(repo.update).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });

    it('audita solo los campos cambiados y bloquea la fila antes de leer', async () => {
      repo.update.mockResolvedValue(offerRow({ name: 'Nueva' }));
      await service.update(1, { name: 'Nueva', description: 'd' }, 1);
      expect(repo.update.mock.calls[0][1]).toEqual({ name: 'Nueva' });
      const entry = audit.log.mock.calls[0][0];
      expect(entry.before).toEqual({ name: 'Oferta' });
      expect(entry.after).toEqual({ name: 'Nueva' });
      expect(repo.lockById.mock.invocationCallOrder[0]).toBeLessThan(
        repo.getById.mock.invocationCallOrder[0],
      );
    });

    it('cambiar estado al mismo valor no escribe ni audita', async () => {
      await service.updateStatus(1, true, 1);
      expect(repo.update).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });
  });

  it('404 si la oferta no existe (update, estado, eliminar, detalle)', async () => {
    repo.getById.mockResolvedValue(null);
    await expect(service.update(9, { name: 'x' }, 1)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.updateStatus(9, true, 1)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.remove(9, 1)).rejects.toThrow(NotFoundException);
    await expect(service.getById(9)).rejects.toThrow(NotFoundException);
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('cambiar estado y eliminar auditan', async () => {
    await service.updateStatus(1, false, 1);
    await service.remove(1, 1);
    expect(audit.log.mock.calls.map((c: any[]) => c[0].action)).toEqual([
      'OFFER_STATUS_CHANGED',
      'OFFER_DELETED',
    ]);
  });
});

describe('OffersController - permisos', () => {
  const proto = OffersController.prototype;

  it('exige ADMINISTRADOR y solo el listado publico es @Public', () => {
    expect(Reflect.getMetadata(ROLES_KEY, OffersController)).toEqual([
      Role.ADMINISTRADOR,
    ]);
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, proto.getPublic)).toBe(true);
    for (const name of [
      'getAdmin',
      'getById',
      'create',
      'update',
      'updateStatus',
      'remove',
    ] as const) {
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, proto[name])).toBeUndefined();
    }
  });
});

describe('DTOs de ofertas', () => {
  const base = { name: 'n', description: 'd', status: true };
  const errs = (o: object) =>
    validateSync(plainToInstance(CreateOfferDto, o)).length;

  it('status es obligatorio', () => {
    expect(
      errs({
        ...base,
        status: undefined,
        start_date: '2030-01-01',
        end_date: '2030-01-02',
      }),
    ).toBeGreaterThan(0);
  });

  it('acepta solo AAAA-MM-DD real o ISO con zona', () => {
    expect(
      errs({
        ...base,
        start_date: '2030-01-01',
        end_date: '2030-01-02T10:00:00Z',
      }),
    ).toBe(0);
    for (const bad of [
      '2026-13-45',
      '2026-02-30',
      '2026-01-01T10:00:00',
      '2026-01-01 10:00',
      'x',
    ]) {
      expect(
        errs({ ...base, start_date: bad, end_date: '2030-01-02' }),
      ).toBeGreaterThan(0);
    }
  });

  it('el filtro admin date rechaza dias inexistentes', () => {
    const e = (date: string) =>
      validateSync(plainToInstance(GetOffersDto, { date })).length;
    expect(e('2030-03-15')).toBe(0);
    expect(e('2026-02-30')).toBeGreaterThan(0);
    expect(e('2026-13-45')).toBeGreaterThan(0);
  });
});
