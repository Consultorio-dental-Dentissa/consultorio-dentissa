import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ServicesService } from './services.service';
import { ServiciosController } from './services.controller';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ROLES_KEY } from 'src/infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

describe('ServicesService.updateService (PATCH /services/:id)', () => {
  const tx = { marker: 'tx' };
  let repo: any;
  let audit: any;
  let service: ServicesService;

  const current = {
    id: 3,
    name: 'Limpieza',
    description: 'Desc',
    price: '100.00',
    durationMinutes: 30,
    status: true,
  };

  beforeEach(() => {
    repo = {
      lockById: jest.fn(),
      getById: jest.fn().mockResolvedValue(current),
      isNameTakenByOther: jest.fn().mockResolvedValue(false),
      applyUpdate: jest.fn(),
      getWithImages: jest.fn().mockResolvedValue({ ...current, images: [] }),
    };
    audit = { log: jest.fn() };
    const prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new ServicesService(repo, prisma as any, audit, {} as any);
  });

  it('sin campos: 400', async () => {
    await expect(service.updateService(3, {}, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('404 si no existe', async () => {
    repo.getById.mockResolvedValue(null);
    await expect(service.updateService(9, { price: 5 }, 1)).rejects.toThrow(
      NotFoundException,
    );
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('duracion fuera de 15-120: 400', async () => {
    await expect(
      service.updateService(3, { durationMinutes: 10 }, 1),
    ).rejects.toThrow('minimo 15 minutos');
    await expect(
      service.updateService(3, { durationMinutes: 121 }, 1),
    ).rejects.toThrow(BadRequestException);
    expect(repo.applyUpdate).not.toHaveBeenCalled();
  });

  it('nombre duplicado: 400 y sin escritura', async () => {
    repo.isNameTakenByOther.mockResolvedValue(true);
    await expect(service.updateService(3, { name: 'Otro' }, 1)).rejects.toThrow(
      'Ya existe un servicio con este nombre',
    );
    expect(repo.applyUpdate).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('actualiza solo lo que cambia y audita changedFields en la misma transaccion', async () => {
    await service.updateService(
      3,
      { name: 'Nuevo', price: 150, durationMinutes: 30, description: 'Desc' },
      1,
    );
    expect(repo.lockById).toHaveBeenCalledWith(3, tx);
    expect(repo.applyUpdate).toHaveBeenCalledWith(
      3,
      { name: 'Nuevo', price: 150 },
      tx,
    );
    expect(audit.log).toHaveBeenCalledWith(
      {
        userId: 1,
        action: 'SERVICE_UPDATED',
        entity: 'SERVICE',
        entityId: 3,
        after: { changedFields: ['name', 'price'] },
      },
      tx,
    );
  });

  it('cambiar la duracion solo escribe en el servicio', async () => {
    await service.updateService(3, { durationMinutes: 60 }, 1);
    expect(repo.applyUpdate).toHaveBeenCalledWith(
      3,
      { durationMinutes: 60 },
      tx,
    );
  });

  it('sin cambios reales: sin escritura ni auditoria', async () => {
    await service.updateService(
      3,
      { name: 'Limpieza', price: 100, durationMinutes: 30 },
      1,
    );
    expect(repo.applyUpdate).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });
});

describe('UpdateServiceDto', () => {
  const errors = (plain: object) =>
    validateSync(plainToInstance(UpdateServiceDto, plain)).map(
      (e) => Object.values(e.constraints ?? {})[0],
    );

  it('valida precio, duracion y nombre con mensajes en español', () => {
    expect(errors({ price: -1 })).toContain(
      'El precio no puede ser un número negativo',
    );
    expect(errors({ durationMinutes: 30.5 })).toContain(
      'La duración del servicio debe ser un número entero',
    );
    expect(errors({ name: '  ' })).toContain(
      'El nombre del servicio no puede estar vacío',
    );
    expect(errors({ price: 0, durationMinutes: 15 })).toHaveLength(0);
  });
});

describe('ServiciosController PATCH /services/:id', () => {
  it('es solo ADMINISTRADOR', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        ServiciosController.prototype.updateService,
      ),
    ).toEqual([Role.ADMINISTRADOR]);
  });
});
