import 'reflect-metadata';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ServicesService } from './services.service';
import { ServiciosController } from './services.controller';
import { OffersService } from '../offers/offers.service';
import { OffersController } from '../offers/offers.controller';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { IS_PUBLIC_KEY } from '../../infrastructure/security/decorators/public.decorator';
import { Role } from '../users/enums/rol.enum';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(16, 2),
]);
const goodFile = () => ({ buffer: PNG, mimetype: 'image/png' });
const NAME = 'c'.repeat(32) + '.png';

describe('ServicesService - imagenes', () => {
  const tx = { marker: 'tx' };
  let repo: any;
  let audit: any;
  let prisma: any;
  let storage: any;
  let service: ServicesService;

  beforeEach(() => {
    repo = {
      lockById: jest.fn(),
      getById: jest.fn().mockResolvedValue({ id: 1 }),
      countImages: jest.fn().mockResolvedValue(0),
      createImage: jest.fn(),
      findImage: jest.fn().mockResolvedValue({
        id: 4,
        url: NAME,
        service: { status: true },
      }),
      replaceImageFile: jest.fn(),
      deleteImage: jest.fn(),
      getWithImages: jest.fn().mockResolvedValue({
        id: 1,
        name: 'S',
        images: [{ id: 4, url: NAME }],
      }),
      getAll: jest.fn(),
    };
    audit = { log: jest.fn() };
    prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    storage = {
      save: jest.fn().mockResolvedValue('d'.repeat(32) + '.png'),
      remove: jest.fn(),
      removeMany: jest.fn(),
    };
    service = new ServicesService(repo, prisma, audit, storage);
  });

  it('el catalogo expone URLs de imagen y nunca el nombre de archivo almacenado', async () => {
    repo.getAll.mockResolvedValue({
      items: [{ id: 1, name: 'S', images: [{ id: 4, url: NAME }] }],
      total: 1,
    });
    const result = await service.getAllServices({}, undefined);
    expect(result).toMatchObject({ total: 1, page: 1, limit: 20 });
    expect(result.items[0].images).toEqual([
      { id: 4, url: '/services/1/images/4' },
    ]);
    expect(JSON.stringify(result)).not.toContain(NAME);
  });

  it('rechaza superar 5 imagenes por servicio', async () => {
    repo.countImages.mockResolvedValue(5);
    await expect(service.addImages(1, [goodFile()], 1)).rejects.toThrow(
      BadRequestException,
    );
    // El archivo se guardo antes de la transaccion y se limpia al fallar
    expect(storage.removeMany).toHaveBeenCalledWith('services', [
      'd'.repeat(32) + '.png',
    ]);
    storage.save.mockClear();
    await expect(
      service.addImages(1, Array.from({ length: 6 }, goodFile), 1),
    ).rejects.toThrow(BadRequestException);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('rechaza extension falsa sin guardar nada', async () => {
    await expect(
      service.addImages(
        1,
        [
          {
            buffer: Buffer.from('MZ ejecutable'),
            mimetype: 'image/jpeg',
            originalname: 'x.jpg',
          },
        ],
        1,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('sube y audita dentro de la transaccion', async () => {
    await service.addImages(1, [goodFile()], 3);
    expect(repo.createImage).toHaveBeenCalledWith(
      1,
      'd'.repeat(32) + '.png',
      tx,
    );
    expect(audit.log.mock.calls[0][0]).toMatchObject({
      userId: 3,
      action: 'SERVICE_IMAGE_ADDED',
    });
    expect(audit.log.mock.calls[0][1]).toBe(tx);
  });

  it('limpia el archivo si la transaccion falla', async () => {
    repo.createImage.mockRejectedValue(new Error('boom'));
    await expect(service.addImages(1, [goodFile()], 3)).rejects.toThrow('boom');
    expect(storage.removeMany).toHaveBeenCalledWith('services', [
      'd'.repeat(32) + '.png',
    ]);
  });

  it('guarda los archivos ANTES de abrir la transaccion', async () => {
    const order: string[] = [];
    storage.save.mockImplementation(() => {
      order.push('save');
      return Promise.resolve('d'.repeat(32) + '.png');
    });
    prisma.$transaction.mockImplementation((cb: any) => {
      order.push('tx');
      return cb(tx);
    });
    await service.addImages(1, [goodFile()], 3);
    expect(order).toEqual(['save', 'tx']);
    // timeout explicito en la transaccion
    expect(prisma.$transaction.mock.calls[0][1]).toMatchObject({
      timeout: expect.any(Number),
    });
  });

  it('replaceImage: guarda antes de la tx y limpia el nuevo si la tx falla', async () => {
    repo.replaceImageFile.mockRejectedValue(new Error('boom'));
    await expect(service.replaceImage(1, 4, goodFile(), 1)).rejects.toThrow(
      'boom',
    );
    expect(storage.remove).toHaveBeenCalledWith(
      'services',
      'd'.repeat(32) + '.png',
    );
    expect(storage.remove).not.toHaveBeenCalledWith('services', NAME);
  });

  it('no permite borrar la ultima imagen de un servicio ACTIVO (spec: 1 a 5)', async () => {
    repo.countImages.mockResolvedValue(1);
    await expect(service.deleteImage(1, 4, 1)).rejects.toThrow(
      ConflictException,
    );
    expect(repo.deleteImage).not.toHaveBeenCalled();
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it('un servicio INACTIVO si puede quedarse sin imagenes', async () => {
    repo.countImages.mockResolvedValue(1);
    repo.findImage.mockResolvedValue({
      id: 4,
      url: NAME,
      service: { status: false },
    });
    await service.deleteImage(1, 4, 1);
    expect(repo.deleteImage).toHaveBeenCalled();
    expect(storage.remove).toHaveBeenCalledWith('services', NAME);
  });

  it('borra la imagen y limpia el archivo tras el commit', async () => {
    repo.countImages.mockResolvedValue(2);
    await service.deleteImage(1, 4, 1);
    expect(storage.remove).toHaveBeenCalledWith('services', NAME);
  });

  it('la imagen debe pertenecer al servicio (ownership)', async () => {
    repo.findImage.mockResolvedValue(null);
    await expect(service.deleteImage(2, 4, 1)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.replaceImage(2, 4, goodFile(), 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('reemplazar guarda el nuevo archivo y borra el anterior', async () => {
    await service.replaceImage(1, 4, goodFile(), 1);
    expect(repo.replaceImageFile).toHaveBeenCalledWith(
      4,
      'd'.repeat(32) + '.png',
      tx,
    );
    expect(storage.remove).toHaveBeenCalledWith('services', NAME);
  });

  it('servir: servicio inactivo solo lo ve un ADMIN; para el resto 404', async () => {
    repo.findImage.mockResolvedValue({
      id: 4,
      url: NAME,
      service: { status: false },
    });
    await expect(
      service.serveImage(1, 4, undefined, {} as any),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.serveImage(1, 4, { role: Role.PACIENTE }, {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('servir: Cache-Control private si el servicio esta inactivo (vista previa admin), public si esta activo', async () => {
    const set = jest.fn();
    const res = { set } as any;
    const open = jest.fn().mockResolvedValue({
      stream: { pipe: jest.fn() },
      size: 1,
      contentType: 'image/png',
    });
    const svc = new ServicesService(repo, prisma, audit, { open } as any);

    repo.findImage.mockResolvedValue({
      id: 4,
      url: NAME,
      service: { status: false },
    });
    await svc.serveImage(1, 4, { role: Role.ADMINISTRADOR }, res);
    expect(set.mock.calls[0][0]['Cache-Control']).toMatch(/^private/);

    repo.findImage.mockResolvedValue({
      id: 4,
      url: NAME,
      service: { status: true },
    });
    await svc.serveImage(1, 4, undefined, res);
    expect(set.mock.calls[1][0]['Cache-Control']).toMatch(/^public/);
  });

  describe('estado y alta de servicios (spec 02: 1-5 imagenes)', () => {
    it('createService crea el servicio INACTIVO (sin imagenes)', async () => {
      repo.existByName = jest.fn().mockResolvedValue(false);
      repo.create = jest.fn().mockResolvedValue({ id: 9, status: false });
      await service.createService(
        { name: 'X', durationMinutes: 30, price: 10, description: 'd' },
        1,
      );
      expect(audit.log.mock.calls[0][0].after.status).toBe(false);
    });

    it('activar sin imagenes => 409; con imagenes => ok', async () => {
      repo.updateStatus = jest.fn().mockResolvedValue(true);
      repo.countImages.mockResolvedValue(0);
      await expect(service.updateServiceStatus(1, true, 1)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.updateStatus).not.toHaveBeenCalled();

      repo.countImages.mockResolvedValue(2);
      await service.updateServiceStatus(1, true, 1);
      expect(repo.updateStatus).toHaveBeenCalledWith(1, true, tx);
    });

    it('desactivar no exige imagenes', async () => {
      repo.updateStatus = jest.fn().mockResolvedValue(true);
      repo.countImages.mockResolvedValue(0);
      await service.updateServiceStatus(1, false, 1);
      expect(repo.updateStatus).toHaveBeenCalledWith(1, false, tx);
    });

    it('GET /services es paginado y solo ADMIN filtra por estado', async () => {
      repo.getAll.mockResolvedValue({ items: [], total: 0 });
      await service.getAllServices(
        { page: 2, limit: 5, status: false, search: 'x' },
        { role: Role.ASISTENTE },
      );
      expect(repo.getAll.mock.calls[0][0]).toMatchObject({
        page: 2,
        limit: 5,
        status: true,
        search: 'x',
      });
    });
  });

  describe('permisos del controller', () => {
    const guard = new RolesGuard(new Reflector());
    const proto = ServiciosController.prototype;
    const ctx = (handler: Function, role: string) =>
      ({
        getHandler: () => handler,
        getClass: () => ServiciosController,
        switchToHttp: () => ({ getRequest: () => ({ user: { id: 1, role } }) }),
      }) as any;

    it('subir, reemplazar y borrar son solo ADMINISTRADOR', () => {
      for (const handler of [
        proto.addImages,
        proto.replaceImage,
        proto.deleteImage,
      ]) {
        expect(guard.canActivate(ctx(handler, Role.ADMINISTRADOR))).toBe(true);
        expect(() => guard.canActivate(ctx(handler, Role.ASISTENTE))).toThrow();
        expect(() => guard.canActivate(ctx(handler, Role.PACIENTE))).toThrow();
      }
    });

    it('la descarga de la imagen es publica', () => {
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, proto.getImage)).toBe(true);
    });
  });
});

describe('OffersService - imagen', () => {
  const tx = { marker: 'tx' };
  const offerRow = (extra: object = {}) => ({
    id: 1,
    name: 'O',
    image: NAME,
    services: [],
    ...extra,
  });
  let repo: any;
  let audit: any;
  let prisma: any;
  let storage: any;
  let service: OffersService;

  beforeEach(() => {
    repo = {
      lockById: jest.fn(),
      getById: jest.fn().mockResolvedValue(offerRow()),
      setImage: jest.fn(),
      getImageInfo: jest.fn(),
      delete: jest.fn(),
    };
    audit = { log: jest.fn() };
    prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    storage = {
      save: jest.fn().mockResolvedValue('e'.repeat(32) + '.png'),
      remove: jest.fn(),
      removeMany: jest.fn(),
    };
    service = new OffersService(repo, prisma, audit, storage);
  });

  it('reemplazar guarda el nuevo, audita y borra el archivo anterior; no expone el nombre', async () => {
    const result = await service.setImage(1, goodFile(), 2);
    expect(repo.setImage).toHaveBeenCalledWith(1, 'e'.repeat(32) + '.png', tx);
    expect(storage.remove).toHaveBeenCalledWith('offers', NAME);
    expect(audit.log.mock.calls[0][0].action).toBe('OFFER_IMAGE_SET');
    expect(result.image_url).toBe('/offers/admin/1/image');
    expect(JSON.stringify(result)).not.toContain('e'.repeat(32));
  });

  it('rechaza archivo falso y oferta inexistente', async () => {
    await expect(
      service.setImage(
        1,
        { buffer: Buffer.from('hola'), mimetype: 'image/png' },
        2,
      ),
    ).rejects.toThrow(BadRequestException);
    // Archivo falso: nunca se guarda
    expect(storage.save).not.toHaveBeenCalled();
    repo.getById.mockResolvedValue(null);
    await expect(service.setImage(1, goodFile(), 2)).rejects.toThrow(
      NotFoundException,
    );
    // El archivo se guardo antes de la tx y se limpia al fallar
    expect(storage.remove).toHaveBeenCalledWith(
      'offers',
      'e'.repeat(32) + '.png',
    );
  });

  it('setImage: tras el commit NO se borra la imagen nueva aunque falle el borrado de la anterior', async () => {
    storage.remove.mockRejectedValueOnce(new Error('disco'));
    await expect(service.setImage(1, goodFile(), 2)).rejects.toThrow('disco');
    expect(storage.remove).not.toHaveBeenCalledWith(
      'offers',
      'e'.repeat(32) + '.png',
    );
    expect(storage.removeMany).not.toHaveBeenCalled();
  });

  it('quitar la imagen la elimina del disco tras el commit', async () => {
    await service.removeImage(1, 2);
    expect(repo.setImage).toHaveBeenCalledWith(1, null, tx);
    expect(storage.remove).toHaveBeenCalledWith('offers', NAME);
  });

  it('borrar la oferta elimina su imagen', async () => {
    await service.remove(1, 2);
    expect(storage.remove).toHaveBeenCalledWith('offers', NAME);
  });

  it('publico: solo sirve imagen de ofertas activas y vigentes', async () => {
    const day = 24 * 3600 * 1000;
    const base = {
      image: NAME,
      status: true,
      start_date: new Date(Date.now() - day),
      end_date: new Date(Date.now() + day),
    };
    for (const info of [
      { ...base, status: false },
      { ...base, start_date: new Date(Date.now() + day) },
      { ...base, end_date: new Date(Date.now() - 1000) },
      { ...base, image: null },
    ]) {
      repo.getImageInfo.mockResolvedValue(info);
      await expect(service.serveImage(1, false, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    }
    repo.getImageInfo.mockResolvedValue(null);
    await expect(service.serveImage(1, false, {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('permisos del controller', () => {
    const guard = new RolesGuard(new Reflector());
    const proto = OffersController.prototype;
    const ctx = (handler: Function, role: string) =>
      ({
        getHandler: () => handler,
        getClass: () => OffersController,
        switchToHttp: () => ({ getRequest: () => ({ user: { id: 1, role } }) }),
      }) as any;

    it('subir/quitar/previsualizar son solo ADMINISTRADOR', () => {
      for (const handler of [
        proto.setImage,
        proto.removeImage,
        proto.getAdminImage,
      ]) {
        expect(guard.canActivate(ctx(handler, Role.ADMINISTRADOR))).toBe(true);
        expect(() => guard.canActivate(ctx(handler, Role.PACIENTE))).toThrow();
        expect(() => guard.canActivate(ctx(handler, Role.ASISTENTE))).toThrow();
      }
    });

    it('la imagen publica de la oferta es @Public', () => {
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, proto.getPublicImage)).toBe(
        true,
      );
    });
  });
});
