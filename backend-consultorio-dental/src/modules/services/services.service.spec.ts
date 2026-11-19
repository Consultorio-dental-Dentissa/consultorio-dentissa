import { ServicesService } from './services.service';
import { Role } from '../users/enums/rol.enum';

describe('ServicesService - visibilidad de servicios inactivos', () => {
  let repository: { getAll: jest.Mock };
  let service: ServicesService;

  beforeEach(() => {
    repository = {
      getAll: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    };
    service = new ServicesService(
      repository as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it('el publico (sin usuario) siempre recibe solo activos, aunque pida inactivos', async () => {
    await service.getAllServices({ status: false } as any, undefined);
    expect(repository.getAll.mock.calls[0][0].status).toBe(true);
  });

  it('el publico sin filtro recibe solo activos', async () => {
    await service.getAllServices(undefined, undefined);
    expect(repository.getAll.mock.calls[0][0].status).toBe(true);
  });

  it('un PACIENTE y un ASISTENTE tambien reciben solo activos', async () => {
    await service.getAllServices({ status: false } as any, {
      role: Role.PACIENTE,
    });
    await service.getAllServices({ status: false } as any, {
      role: Role.ASISTENTE,
    });
    expect(repository.getAll.mock.calls[0][0].status).toBe(true);
    expect(repository.getAll.mock.calls[1][0].status).toBe(true);
  });

  it('un ADMINISTRADOR puede filtrar inactivos', async () => {
    await service.getAllServices({ status: false } as any, {
      role: Role.ADMINISTRADOR,
    });
    expect(repository.getAll.mock.calls[0][0].status).toBe(false);
  });

  it('un ADMINISTRADOR sin filtro ve todos', async () => {
    await service.getAllServices({} as any, { role: Role.ADMINISTRADOR });
    expect(repository.getAll.mock.calls[0][0].status).toBeUndefined();
  });
});

describe('ServicesService - auditoria', () => {
  const tx = { marker: 'tx' };
  let repository: any;
  let audit: any;
  let service: ServicesService;

  beforeEach(() => {
    repository = {
      existByName: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue({
        id: 4,
        name: 'Limpieza',
        durationMinutes: 30,
        price: '10.00',
        status: true,
      }),
      lockById: jest.fn(),
      countImages: jest.fn().mockResolvedValue(1),
      getById: jest.fn().mockResolvedValue({ id: 4, status: true }),
      updateStatus: jest.fn().mockResolvedValue(true),
    };
    audit = { log: jest.fn() };
    const prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new ServicesService(repository, prisma as any, audit, {} as any);
  });

  it('crear servicio audita en la misma transaccion', async () => {
    await service.createService(
      { name: 'Limpieza', durationMinutes: 30, price: 10, description: 'd' },
      1,
    );
    expect(repository.create.mock.calls[0][1]).toBe(tx);
    expect(audit.log.mock.calls[0][0]).toMatchObject({
      userId: 1,
      action: 'SERVICE_CREATED',
      entityId: 4,
    });
    expect(audit.log.mock.calls[0][1]).toBe(tx);
  });

  it('cambiar estado audita antes/despues y 404 si no existe', async () => {
    await service.updateServiceStatus(4, false, 1);
    expect(audit.log.mock.calls[0][0]).toMatchObject({
      action: 'SERVICE_STATUS_CHANGED',
      before: { status: true },
      after: { status: false },
    });

    repository.getById.mockResolvedValue(null);
    await expect(service.updateServiceStatus(9, true, 1)).rejects.toThrow();
    expect(audit.log).toHaveBeenCalledTimes(1);
  });
});
