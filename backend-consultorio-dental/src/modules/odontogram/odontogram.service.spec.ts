/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Reflector } from '@nestjs/core';
import { OdontogramService } from './odontogram.service';
import { OdontogramController } from './odontogram.controller';
import { UpdateToothDto } from './dto/update-tooth.dto';
import { FDI_TEETH } from './odontogram.constants';
import { sanitizeAuditData } from '../audit/audit-sanitize';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Role } from '../users/enums/rol.enum';

const SECRET = 'nota-clinica-secreta';

describe('OdontogramService', () => {
  const tx = { marker: 'tx' };
  let repo: any;
  let audit: any;
  let prisma: any;
  let service: OdontogramService;

  beforeEach(() => {
    repo = {
      patientExists: jest.fn().mockResolvedValue(true),
      findByPatient: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      upsert: jest.fn(),
    };
    audit = { log: jest.fn() };
    prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new OdontogramService(repo, prisma, audit);
  });

  describe('getByPatient', () => {
    it('devuelve siempre los 32 dientes ordenados, SANO y sin nota por defecto', async () => {
      const res = await service.getByPatient(5);
      expect(res.patient_id).toBe(5);
      expect(res.teeth).toHaveLength(32);
      expect(res.teeth.map((t) => t.tooth_number)).toEqual([...FDI_TEETH]);
      expect(res.teeth.map((t) => t.tooth_number).slice(0, 3)).toEqual([
        11, 12, 13,
      ]);
      for (const tooth of res.teeth) {
        expect(tooth).toMatchObject({
          status: 'SANO',
          notes: null,
          updated_at: null,
        });
      }
    });

    it('mezcla las filas guardadas con los valores por defecto', async () => {
      const when = new Date();
      repo.findByPatient.mockResolvedValue([
        { tooth_number: 26, status: 'CARIES', notes: 'x', updated_at: when },
      ]);
      const res = await service.getByPatient(5);
      expect(res.teeth).toHaveLength(32);
      const t26 = res.teeth.find((t) => t.tooth_number === 26);
      expect(t26).toEqual({
        tooth_number: 26,
        status: 'CARIES',
        notes: 'x',
        updated_at: when,
      });
      expect(res.teeth.filter((t) => t.status === 'SANO')).toHaveLength(31);
    });

    it('paciente inexistente -> 404', async () => {
      repo.patientExists.mockResolvedValue(false);
      await expect(service.getByPatient(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTooth', () => {
    const saved = (over: object = {}) => ({
      tooth_number: 16,
      status: 'CARIES',
      notes: null,
      updated_at: new Date(),
      ...over,
    });

    it.each([0, 10, 19, 29, 39, 49, 51, 99, -11])(
      'diente %i invalido -> 400 sin tocar la BD',
      async (tooth) => {
        await expect(
          service.updateTooth(5, tooth, { status: 'CARIES' } as any, 1),
        ).rejects.toThrow(BadRequestException);
        expect(prisma.$transaction).not.toHaveBeenCalled();
      },
    );

    it('paciente inexistente -> 404 y nada se escribe', async () => {
      repo.patientExists.mockResolvedValue(false);
      await expect(
        service.updateTooth(99, 16, { status: 'CARIES' } as any, 1),
      ).rejects.toThrow(NotFoundException);
      expect(repo.upsert).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });

    it('hace upsert y audita en la misma transaccion', async () => {
      repo.upsert.mockResolvedValue(saved({ notes: SECRET }));
      const res = await service.updateTooth(
        5,
        16,
        { status: 'CARIES', notes: SECRET } as any,
        7,
      );
      expect(repo.upsert).toHaveBeenCalledWith(
        5,
        16,
        { status: 'CARIES', notes: SECRET },
        7,
        tx,
      );
      expect(res).toMatchObject({
        tooth_number: 16,
        status: 'CARIES',
        notes: SECRET,
      });
      expect(audit.log).toHaveBeenCalledTimes(1);
      expect(audit.log.mock.calls[0][1]).toBe(tx);
    });

    it('la auditoria nunca contiene el contenido de la nota', async () => {
      repo.upsert.mockResolvedValue(saved({ notes: SECRET }));
      await service.updateTooth(
        5,
        16,
        { status: 'CARIES', notes: SECRET } as any,
        7,
      );
      const entry = audit.log.mock.calls[0][0];
      expect(entry).toMatchObject({
        userId: 7,
        action: 'ODONTOGRAM_TOOTH_UPDATED',
        entity: 'PATIENT',
        entityId: 5,
        before: { tooth_number: 16, status: 'SANO' },
        after: { tooth_number: 16, status: 'CARIES', note_changed: true },
      });
      expect(JSON.stringify(entry)).not.toContain(SECRET);
      // Tras el saneado de AuditService el indicador sigue presente.
      expect(sanitizeAuditData(entry.after)).toHaveProperty(
        'note_changed',
        true,
      );
    });

    it('note_changed es false si solo cambia el estado', async () => {
      repo.findOne.mockResolvedValue(saved({ status: 'CARIES', notes: 'a' }));
      repo.upsert.mockResolvedValue(saved({ status: 'CORONA', notes: 'a' }));
      await service.updateTooth(
        5,
        16,
        { status: 'CORONA', notes: 'a' } as any,
        7,
      );
      const entry = audit.log.mock.calls[0][0];
      expect(entry.before.status).toBe('CARIES');
      expect(entry.after).toMatchObject({
        status: 'CORONA',
        note_changed: false,
      });
    });

    it('sin cambios reales no escribe ni audita ni falla', async () => {
      repo.findOne.mockResolvedValue(saved({ status: 'CARIES', notes: 'a' }));
      const res = await service.updateTooth(
        5,
        16,
        { status: 'CARIES', notes: 'a' } as any,
        7,
      );
      expect(res).toMatchObject({ status: 'CARIES', notes: 'a' });
      expect(repo.upsert).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });

    it('SANO sin nota sobre un diente sin fila es no-op (no crea fila)', async () => {
      const res = await service.updateTooth(
        5,
        16,
        { status: 'SANO' } as any,
        7,
      );
      expect(res).toEqual({
        tooth_number: 16,
        status: 'SANO',
        notes: null,
        updated_at: null,
      });
      expect(repo.upsert).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });

    it('volver a SANO un diente con fila si se guarda y audita', async () => {
      repo.findOne.mockResolvedValue(saved());
      repo.upsert.mockResolvedValue(saved({ status: 'SANO' }));
      await service.updateTooth(5, 16, { status: 'SANO' } as any, 7);
      expect(repo.upsert).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledTimes(1);
    });
  });
});

describe('UpdateToothDto', () => {
  const check = async (body: object) => {
    const dto = plainToInstance(UpdateToothDto, body);
    return { dto, errors: await validate(dto) };
  };

  it('acepta estado valido y nota opcional', async () => {
    expect((await check({ status: 'CORONA' })).errors).toHaveLength(0);
    expect(
      (await check({ status: 'REMOVIDO', notes: 'ok' })).errors,
    ).toHaveLength(0);
  });

  it('rechaza estado fuera del enum o ausente', async () => {
    expect((await check({ status: 'ROTO' })).errors).not.toHaveLength(0);
    expect((await check({})).errors).not.toHaveLength(0);
  });

  it('nota: trim, vacia = null y maximo 300', async () => {
    const trimmed = await check({ status: 'CARIES', notes: '  hola  ' });
    expect(trimmed.dto.notes).toBe('hola');
    const empty = await check({ status: 'CARIES', notes: '   ' });
    expect(empty.errors).toHaveLength(0);
    expect(empty.dto.notes).toBeNull();
    expect(
      (await check({ status: 'CARIES', notes: 'a'.repeat(300) })).errors,
    ).toHaveLength(0);
    expect(
      (await check({ status: 'CARIES', notes: 'a'.repeat(301) })).errors,
    ).not.toHaveLength(0);
  });
});

describe('OdontogramController permisos', () => {
  const guard = new RolesGuard(new Reflector());
  const ctx = (role: string, handler: (...a: any[]) => any) =>
    ({
      getHandler: () => handler,
      getClass: () => OdontogramController,
      switchToHttp: () => ({ getRequest: () => ({ user: { id: 1, role } }) }),
    }) as any;

  it.each([
    ['get', OdontogramController.prototype.get],
    ['updateTooth', OdontogramController.prototype.updateTooth],
  ])('%s: solo ADMINISTRADOR', (_name, handler) => {
    expect(guard.canActivate(ctx(Role.ADMINISTRADOR, handler))).toBe(true);
    expect(() => guard.canActivate(ctx(Role.ASISTENTE, handler))).toThrow();
    expect(() => guard.canActivate(ctx(Role.PACIENTE, handler))).toThrow();
  });
});
