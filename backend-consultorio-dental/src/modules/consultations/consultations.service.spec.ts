import 'reflect-metadata';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Role } from '../users/enums/rol.enum';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(16, 2),
]);
const goodFile = () => ({ buffer: PNG, mimetype: 'image/png' });

const row = (extra: object = {}) => ({
  id: 7,
  appointment_id: 3,
  notes: 'texto clinico secreto',
  observations: 'observaciones secretas',
  created_at: new Date(),
  updated_at: new Date(),
  created_by_id: 1,
  updated_by_id: 1,
  appointment: {
    id: 3,
    scheduled_at: new Date(),
    status: 'COMPLETADA',
    service: { id: 1, name: 'Limpieza' },
    patient: { id: 10, user: { name: 'Ana', lastname: 'Perez' } },
  },
  images: [] as { id: number; url: string }[],
  ...extra,
});

describe('ConsultationsService', () => {
  const tx = { marker: 'tx' };
  let repo: any;
  let audit: any;
  let prisma: any;
  let storage: any;
  let service: ConsultationsService;

  beforeEach(() => {
    repo = {
      getAll: jest.fn().mockResolvedValue({ items: [row()], total: 1 }),
      getById: jest.fn().mockResolvedValue(row()),
      lockById: jest.fn(),
      getAppointmentForConsultation: jest.fn().mockResolvedValue({
        id: 3,
        status: 'COMPLETADA',
        scheduled_at: new Date(),
        patient: { user_id: 55 },
        consultation: null,
      }),
      create: jest.fn().mockResolvedValue(row()),
      update: jest.fn().mockResolvedValue(row()),
      countImages: jest.fn().mockResolvedValue(0),
      createImage: jest.fn(),
      findImage: jest.fn(),
      deleteImage: jest.fn(),
      createNotification: jest.fn(),
    };
    audit = { log: jest.fn() };
    prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    storage = {
      save: jest.fn().mockResolvedValue('a'.repeat(32) + '.png'),
      remove: jest.fn(),
      removeMany: jest.fn(),
    };
    service = new ConsultationsService(repo, prisma, audit, storage);
  });

  describe('crear', () => {
    it('rechaza una cita inexistente (404)', async () => {
      repo.getAppointmentForConsultation.mockResolvedValue(null);
      await expect(
        service.create({ appointment_id: 99, description: 'x' } as any, 1),
      ).rejects.toThrow(NotFoundException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it.each(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'REPROGRAMADA'])(
      'rechaza una cita %s: solo las COMPLETADAS admiten consulta (409)',
      async (status) => {
        repo.getAppointmentForConsultation.mockResolvedValue({
          id: 3,
          status,
          scheduled_at: new Date(),
          patient: { user_id: 55 },
          consultation: null,
        });
        await expect(
          service.create({ appointment_id: 3, description: 'x' } as any, 1),
        ).rejects.toThrow(ConflictException);
        expect(repo.create).not.toHaveBeenCalled();
        expect(audit.log).not.toHaveBeenCalled();
      },
    );

    it('rechaza una segunda consulta para la misma cita (409)', async () => {
      repo.getAppointmentForConsultation.mockResolvedValue({
        id: 3,
        status: 'COMPLETADA',
        scheduled_at: new Date(),
        patient: { user_id: 55 },
        consultation: { id: 1 },
      });
      await expect(
        service.create({ appointment_id: 3, description: 'x' } as any, 1),
      ).rejects.toThrow(ConflictException);
    });

    it('una carrera que dispara el UNIQUE tambien responde 409', async () => {
      repo.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('dup', {
          code: 'P2002',
          clientVersion: 'x',
        }),
      );
      await expect(
        service.create({ appointment_id: 3, description: 'x' } as any, 1),
      ).rejects.toThrow(ConflictException);
    });

    it('crea registrando al autor, mapea description/dentistObservations y audita sin datos clinicos', async () => {
      const result = await service.create(
        {
          appointment_id: 3,
          description: '  descripcion  ',
          dentistObservations: ' obs ',
        } as any,
        9,
      );

      expect(repo.create).toHaveBeenCalledWith(
        {
          appointment_id: 3,
          notes: 'descripcion',
          observations: 'obs',
          created_by_id: 9,
        },
        tx,
      );
      expect(result.description).toBe('texto clinico secreto');
      expect(result.dentistObservations).toBe('observaciones secretas');

      const entry = audit.log.mock.calls[0];
      expect(entry[0]).toMatchObject({
        userId: 9,
        action: 'CONSULTATION_CREATED',
        entity: 'CONSULTATION',
        entityId: 7,
      });
      expect(JSON.stringify(entry[0])).not.toMatch(/secret|descripcion/);
      expect(entry[1]).toBe(tx);

      // La notificacion viaja en la misma transaccion y no lleva texto clinico
      const notif = repo.createNotification.mock.calls[0];
      expect(notif[0].user_id).toBe(55);
      expect(notif[0].message).not.toMatch(/descripcion|secret/);
      expect(notif[1]).toBe(tx);
    });
  });

  describe('modificar', () => {
    it('exige al menos un campo', async () => {
      await expect(service.update(7, {} as any, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('404 si la consulta no existe', async () => {
      repo.getById.mockResolvedValue(null);
      await expect(
        service.update(7, { description: 'x' } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('audita solo los nombres de campo cambiados, con el actor, dentro de la transaccion', async () => {
      await service.update(7, { description: 'nuevo texto' } as any, 4);

      expect(repo.update).toHaveBeenCalledWith(
        7,
        { notes: 'nuevo texto', updated_by_id: 4 },
        tx,
      );
      const [entry, usedTx] = audit.log.mock.calls[0];
      expect(entry).toMatchObject({
        userId: 4,
        action: 'CONSULTATION_UPDATED',
        after: { changedFields: ['description'] },
      });
      expect(JSON.stringify(entry)).not.toContain('nuevo texto');
      expect(usedTx).toBe(tx);
      expect(repo.createNotification).toHaveBeenCalled();
    });

    it('sin cambios reales no escribe, notifica ni audita', async () => {
      await service.update(
        7,
        { description: 'texto clinico secreto' } as any,
        4,
      );
      expect(repo.update).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });
  });

  describe('imagenes', () => {
    it('exige al menos un archivo', async () => {
      await expect(service.addImages(7, undefined, 1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.addImages(7, [], 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rechaza mas de 5 archivos en una sola peticion', async () => {
      const files = Array.from({ length: 6 }, goodFile);
      await expect(service.addImages(7, files, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('rechaza si el total superaria 5 (ya tiene 4 y suben 2)', async () => {
      repo.countImages.mockResolvedValue(4);
      await expect(
        service.addImages(7, [goodFile(), goodFile()], 1),
      ).rejects.toThrow(BadRequestException);
      // Los archivos se guardan antes de la tx; al fallar se limpian
      expect(storage.removeMany).toHaveBeenCalledWith(
        'consultations',
        expect.arrayContaining([expect.stringMatching(/.png$/)]),
      );
      expect(repo.createImage).not.toHaveBeenCalled();
    });

    it('guarda los archivos ANTES de abrir la transaccion y usa timeout explicito', async () => {
      const order: string[] = [];
      storage.save.mockImplementation(() => {
        order.push('save');
        return Promise.resolve('a'.repeat(32) + '.png');
      });
      prisma.$transaction.mockImplementation((cb: any) => {
        order.push('tx');
        return cb(tx);
      });
      await service.addImages(7, [goodFile()], 1);
      expect(order).toEqual(['save', 'tx']);
      expect(prisma.$transaction.mock.calls[0][1]).toMatchObject({
        timeout: expect.any(Number),
      });
    });

    it('permite llegar exactamente a 5', async () => {
      repo.countImages.mockResolvedValue(3);
      await service.addImages(7, [goodFile(), goodFile()], 1);
      expect(repo.createImage).toHaveBeenCalledTimes(2);
      expect(audit.log.mock.calls[0][0].action).toBe(
        'CONSULTATION_IMAGE_ADDED',
      );
    });

    it('rechaza un archivo con extension falsa antes de tocar disco o BD', async () => {
      await expect(
        service.addImages(
          7,
          [
            goodFile(),
            {
              buffer: Buffer.from('<script>alert(1)</script>'),
              mimetype: 'image/png',
              originalname: 'inocente.png',
            },
          ],
          1,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(storage.save).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('404 si la consulta no existe y no deja archivos huerfanos si la transaccion falla', async () => {
      repo.getById.mockResolvedValue(null);
      await expect(service.addImages(99, [goodFile()], 1)).rejects.toThrow(
        NotFoundException,
      );

      repo.getById.mockResolvedValue(row());
      repo.createImage.mockRejectedValue(new Error('db caida'));
      await expect(service.addImages(7, [goodFile()], 1)).rejects.toThrow(
        'db caida',
      );
      expect(storage.removeMany).toHaveBeenLastCalledWith(
        'consultations',
        expect.arrayContaining([expect.stringMatching(/\.png$/)]),
      );
    });

    it('borrar: la imagen debe pertenecer a la consulta (ownership) y se elimina el archivo tras el commit', async () => {
      repo.findImage.mockResolvedValue(null);
      await expect(service.deleteImage(7, 55, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(storage.remove).not.toHaveBeenCalled();

      repo.findImage.mockResolvedValue({
        id: 55,
        url: 'f'.repeat(32) + '.png',
      });
      await service.deleteImage(7, 55, 1);
      expect(repo.findImage).toHaveBeenLastCalledWith(7, 55, tx);
      expect(repo.deleteImage).toHaveBeenCalledWith(55, tx);
      expect(storage.remove).toHaveBeenCalledWith(
        'consultations',
        'f'.repeat(32) + '.png',
      );
      expect(audit.log.mock.calls[0][0].action).toBe(
        'CONSULTATION_IMAGE_DELETED',
      );
    });

    it('si la transaccion de borrado falla, el archivo NO se elimina', async () => {
      repo.findImage.mockResolvedValue({
        id: 55,
        url: 'f'.repeat(32) + '.png',
      });
      repo.deleteImage.mockRejectedValue(new Error('fallo'));
      await expect(service.deleteImage(7, 55, 1)).rejects.toThrow('fallo');
      expect(storage.remove).not.toHaveBeenCalled();
    });

    it('descargar: una imagen de otra consulta responde 404', async () => {
      repo.findImage.mockResolvedValue(null);
      await expect(service.serveImage(7, 55, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listado', () => {
    it('valida el rango de fechas', async () => {
      await expect(
        service.getAll({ from: '2030-02-10', to: '2030-02-01' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('devuelve el contrato paginado y nunca el nombre de archivo almacenado', async () => {
      repo.getAll.mockResolvedValue({
        items: [row({ images: [{ id: 5, url: 'f'.repeat(32) + '.png' }] })],
        total: 1,
      });
      const result = await service.getAll({ page: 2, limit: 5 } as any);
      expect(result).toMatchObject({ total: 1, page: 2, limit: 5 });
      expect(result.items[0].images).toEqual([
        { id: 5, url: '/consultations/7/images/5' },
      ]);
      expect(JSON.stringify(result)).not.toContain('f'.repeat(32));
    });
  });
});

describe('ConsultationsController - permisos', () => {
  const guard = new RolesGuard(new Reflector());
  const proto = ConsultationsController.prototype;
  const handlers = [
    proto.getAll,
    proto.getById,
    proto.create,
    proto.update,
    proto.addImages,
    proto.getImage,
    proto.deleteImage,
  ];
  const ctx = (handler: Function, role: string) =>
    ({
      getHandler: () => handler,
      getClass: () => ConsultationsController,
      switchToHttp: () => ({ getRequest: () => ({ user: { id: 1, role } }) }),
    }) as any;

  it.each([Role.ASISTENTE, Role.PACIENTE])(
    '%s no puede usar NINGUN endpoint de consultas ni de sus imagenes',
    (role) => {
      for (const handler of handlers) {
        expect(() => guard.canActivate(ctx(handler, role))).toThrow();
      }
    },
  );

  it('ADMINISTRADOR puede usar todos', () => {
    for (const handler of handlers) {
      expect(guard.canActivate(ctx(handler, Role.ADMINISTRADOR))).toBe(true);
    }
  });
});
