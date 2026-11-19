import 'reflect-metadata';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationsController } from './notifications.controller';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { ROLES_KEY } from 'src/infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

describe('NotificationsRepository - propiedad de los datos', () => {
  let prisma: any;
  let repo: NotificationsRepository;

  beforeEach(() => {
    prisma = {
      notification: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    repo = new NotificationsRepository(prisma);
  });

  it('listar filtra siempre por el usuario autenticado y por leidas', async () => {
    await repo.getAllByUser(5, { read: false, page: 1, limit: 10 });
    expect(prisma.notification.findMany.mock.calls[0][0].where).toEqual({
      user_id: 5,
      is_read: false,
    });
    expect(prisma.notification.count.mock.calls[0][0].where.user_id).toBe(5);
  });

  it('contador de no leidas solo cuenta las del usuario', async () => {
    await repo.countUnread(5);
    expect(prisma.notification.count.mock.calls[0][0].where).toEqual({
      user_id: 5,
      is_read: false,
    });
  });

  it('marcar una como leida incluye user_id en el where (nunca una ajena)', async () => {
    prisma.notification.count.mockResolvedValue(0);
    const found = await repo.markAsRead(10, 5);
    expect(prisma.notification.updateMany.mock.calls[0][0].where).toMatchObject(
      { id: 10, user_id: 5 },
    );
    expect(found).toBe(false);
  });

  it('marcar una ya leida es idempotente', async () => {
    prisma.notification.count.mockResolvedValue(1);
    await expect(repo.markAsRead(10, 5)).resolves.toBe(true);
  });

  it('marcar una escribe read_at', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });
    await repo.markAsRead(10, 5);
    const data = prisma.notification.updateMany.mock.calls[0][0].data;
    expect(data.is_read).toBe(true);
    expect(data.read_at).toBeInstanceOf(Date);
  });

  it('marcar todas solo afecta las no leidas del usuario', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 3 });
    await expect(repo.markAllAsRead(5)).resolves.toBe(3);
    expect(prisma.notification.updateMany.mock.calls[0][0].where).toEqual({
      user_id: 5,
      is_read: false,
    });
  });
});

describe('NotificationsService', () => {
  let repo: any;
  let service: NotificationsService;

  beforeEach(() => {
    repo = {
      getAllByUser: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      countUnread: jest.fn().mockResolvedValue(4),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn().mockResolvedValue(2),
    };
    service = new NotificationsService(repo);
  });

  it('una notificacion ajena o inexistente responde 404', async () => {
    repo.markAsRead.mockResolvedValue(false);
    await expect(service.markAsRead(1, 5)).rejects.toThrow(NotFoundException);
  });

  it('devuelve la pagina con el formato estandar', async () => {
    await expect(service.getMine(5, { page: 3, limit: 5 })).resolves.toEqual({
      items: [],
      total: 0,
      page: 3,
      limit: 5,
    });
    expect(repo.getAllByUser.mock.calls[0][0]).toBe(5);
  });

  it('contador y marcar todas', async () => {
    await expect(service.getUnreadCount(5)).resolves.toEqual({ unread: 4 });
    await expect(service.markAllAsRead(5)).resolves.toEqual({ updated: 2 });
  });
});

describe('NotificationsController', () => {
  it('permite a los tres roles', () => {
    expect(Reflect.getMetadata(ROLES_KEY, NotificationsController)).toEqual([
      Role.ADMINISTRADOR,
      Role.ASISTENTE,
      Role.PACIENTE,
    ]);
  });

  it('el id de usuario sale del token y sin usuario responde 401', async () => {
    const service: any = { getMine: jest.fn(), markAsRead: jest.fn() };
    const controller = new NotificationsController(service);

    await controller.getMine({}, { user: { id: 8, role: 'PACIENTE' } } as any);
    expect(service.getMine.mock.calls[0][0]).toBe(8);

    await controller.markAsRead(3, {
      user: { id: 8, role: 'PACIENTE' },
    } as any);
    expect(service.markAsRead).toHaveBeenCalledWith(3, 8);

    await expect(controller.getMine({}, {} as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

describe('GetNotificationsDto', () => {
  it('convierte read=true/false y rechaza otros valores', () => {
    expect(plainToInstance(GetNotificationsDto, { read: 'false' }).read).toBe(
      false,
    );
    expect(
      validateSync(plainToInstance(GetNotificationsDto, { read: 'true' })),
    ).toHaveLength(0);
    expect(
      validateSync(plainToInstance(GetNotificationsDto, { read: 'quiza' })),
    ).not.toHaveLength(0);
    expect(validateSync(plainToInstance(GetNotificationsDto, {}))).toHaveLength(
      0,
    );
  });
});
