import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { CreateFaqDto, GetFaqDto } from './dto/faq.dto';
import { ROLES_KEY } from 'src/infrastructure/security/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from 'src/infrastructure/security/decorators/public.decorator';
import { Role } from '../users/enums/rol.enum';

describe('FaqService', () => {
  const tx = { marker: 'tx' };
  let repo: any;
  let audit: any;
  let prisma: any;
  let service: FaqService;

  beforeEach(() => {
    repo = {
      getAll: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getById: jest.fn().mockResolvedValue({
        id: 1,
        question: 'q',
        response: 'r',
        status: true,
      }),
      create: jest.fn().mockResolvedValue({
        id: 2,
        question: 'q',
        response: 'r',
        status: true,
      }),
      update: jest.fn().mockResolvedValue({
        id: 1,
        question: 'q2',
        response: 'r',
        status: false,
      }),
      delete: jest.fn(),
      lockById: jest.fn(),
    };
    audit = { log: jest.fn() };
    prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new FaqService(repo, prisma, audit);
  });

  it('el listado publico fuerza solo activas aunque pidan inactivas', async () => {
    await service.getPublic({ status: false, search: 'x' } as any);
    expect(repo.getAll.mock.calls[0][1]).toEqual({
      onlyActive: true,
      publicFields: true,
    });
  });

  it('el listado admin respeta el filtro de estado y devuelve todos los campos', async () => {
    const result = await service.getAdmin({ status: false, page: 2 } as any);
    expect(repo.getAll.mock.calls[0][0].status).toBe(false);
    expect(repo.getAll.mock.calls[0][1]).toEqual({
      onlyActive: false,
      publicFields: false,
    });
    expect(result).toMatchObject({ page: 2, limit: 20, total: 0 });
  });

  it('crear audita en la misma transaccion', async () => {
    await service.create({ question: ' q ', response: ' r ' } as any, 1);
    expect(repo.create.mock.calls[0][0]).toMatchObject({
      question: 'q',
      response: 'r',
    });
    expect(repo.create.mock.calls[0][1]).toBe(tx);
    expect(audit.log.mock.calls[0][0]).toMatchObject({
      action: 'FAQ_CREATED',
      userId: 1,
    });
    expect(audit.log.mock.calls[0][1]).toBe(tx);
  });

  it('actualizar, cambiar estado y eliminar responden 404 si no existe y no auditan', async () => {
    repo.getById.mockResolvedValue(null);
    await expect(service.update(9, { question: 'x' }, 1)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.updateStatus(9, false, 1)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.remove(9, 1)).rejects.toThrow(NotFoundException);
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('PATCH sin campos responde 400', async () => {
    await expect(service.update(1, {}, 1)).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('PATCH sin cambios reales no escribe ni audita', async () => {
    await service.update(1, { question: ' q ', response: 'r' }, 1);
    expect(repo.update).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('PATCH audita solo los campos cambiados y bloquea la fila antes de leer', async () => {
    await service.update(1, { question: 'q2', response: 'r' }, 1);
    expect(repo.update.mock.calls[0][1]).toEqual({ question: 'q2' });
    expect(audit.log.mock.calls[0][0]).toMatchObject({
      before: { question: 'q' },
      after: { question: 'q2' },
    });
    expect(repo.lockById.mock.invocationCallOrder[0]).toBeLessThan(
      repo.getById.mock.invocationCallOrder[0],
    );
  });

  it('cambiar el estado al mismo valor no escribe ni audita', async () => {
    await service.updateStatus(1, true, 1);
    expect(repo.update).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('cambiar estado y eliminar auditan', async () => {
    await service.updateStatus(1, false, 1);
    await service.remove(1, 1);
    expect(audit.log.mock.calls.map((c: any[]) => c[0].action)).toEqual([
      'FAQ_STATUS_CHANGED',
      'FAQ_DELETED',
    ]);
  });
});

describe('FaqController - permisos', () => {
  const proto = FaqController.prototype;

  it('la clase exige ADMINISTRADOR y solo el listado publico es @Public', () => {
    expect(Reflect.getMetadata(ROLES_KEY, FaqController)).toEqual([
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

describe('DTOs de FAQ', () => {
  it('exige pregunta y respuesta', () => {
    expect(validateSync(plainToInstance(CreateFaqDto, {}))).not.toHaveLength(0);
    expect(
      validateSync(
        plainToInstance(CreateFaqDto, { question: 'q', response: 'r' }),
      ),
    ).toHaveLength(0);
  });

  it('el filtro de estado acepta ACTIVO/INACTIVO y rechaza otros valores', () => {
    const check = (status?: string) =>
      validateSync(plainToInstance(GetFaqDto, status ? { status } : {}));

    expect(check()).toHaveLength(0);
    expect(check('ACTIVO')).toHaveLength(0);
    expect(check('INACTIVO')).toHaveLength(0);
    expect(check('otro')).not.toHaveLength(0);
    expect(plainToInstance(GetFaqDto, { status: 'INACTIVO' }).status).toBe(
      false,
    );
    expect(plainToInstance(GetFaqDto, {}).status).toBeUndefined();
  });
});
