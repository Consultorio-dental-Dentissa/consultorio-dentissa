import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UsersService } from './users.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UpdateServiceStatusDto } from '../services/dto/update-service-status.dto';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { Role } from './enums/rol.enum';

describe('UsersService.updateUserStatus', () => {
  let users: any;
  let prisma: any;
  let audit: any;
  let service: UsersService;

  beforeEach(() => {
    users = {
      getByIdWithStatus: jest.fn(),
      countActiveAdmins: jest.fn().mockResolvedValue(2),
      updateUserStatus: jest.fn().mockResolvedValue(true),
    };
    prisma = {
      $transaction: jest.fn((work: (tx: unknown) => unknown) => work({})),
    };
    audit = { log: jest.fn() };
    service = new UsersService(users, {} as any, prisma, audit);
  });

  it('audita el cambio de estado con antes/despues dentro de la transaccion', async () => {
    users.getByIdWithStatus.mockResolvedValue({
      id: 5,
      status: true,
      role: { role: Role.PACIENTE },
    });
    await service.updateUserStatus(5, false, 1);
    expect(audit.log).toHaveBeenCalledWith(
      {
        userId: 1,
        action: 'USER_STATUS_CHANGED',
        entity: 'USER',
        entityId: 5,
        before: { status: true },
        after: { status: false },
      },
      expect.anything(),
    );
  });

  it('un cambio rechazado no se audita', async () => {
    users.getByIdWithStatus.mockResolvedValue({
      id: 1,
      status: true,
      role: { role: Role.ADMINISTRADOR },
    });
    await expect(service.updateUserStatus(1, false, 1)).rejects.toThrow();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('404 si el usuario no existe', async () => {
    users.getByIdWithStatus.mockResolvedValue(null);
    await expect(service.updateUserStatus(9, false, 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('un ADMIN no puede desactivarse a si mismo', async () => {
    users.getByIdWithStatus.mockResolvedValue({
      id: 1,
      status: true,
      role: { role: Role.ADMINISTRADOR },
    });
    await expect(service.updateUserStatus(1, false, 1)).rejects.toThrow(
      ForbiddenException,
    );
    expect(users.updateUserStatus).not.toHaveBeenCalled();
  });

  it('no se puede desactivar al ultimo ADMIN activo', async () => {
    users.getByIdWithStatus.mockResolvedValue({
      id: 2,
      status: true,
      role: { role: Role.ADMINISTRADOR },
    });
    users.countActiveAdmins.mockResolvedValue(1);
    await expect(service.updateUserStatus(2, false, 1)).rejects.toThrow(
      BadRequestException,
    );
    expect(users.updateUserStatus).not.toHaveBeenCalled();
  });

  it('puede desactivar a otro ADMIN si quedan mas activos', async () => {
    users.getByIdWithStatus.mockResolvedValue({
      id: 2,
      status: true,
      role: { role: Role.ADMINISTRADOR },
    });
    await expect(service.updateUserStatus(2, false, 1)).resolves.toBe(true);
  });

  it('puede desactivar a un usuario que no es ADMIN sin contar administradores', async () => {
    users.getByIdWithStatus.mockResolvedValue({
      id: 5,
      status: true,
      role: { role: Role.PACIENTE },
    });
    await expect(service.updateUserStatus(5, false, 1)).resolves.toBe(true);
    expect(users.countActiveAdmins).not.toHaveBeenCalled();
  });

  it('reactivar nunca esta bloqueado', async () => {
    users.getByIdWithStatus.mockResolvedValue({
      id: 1,
      status: false,
      role: { role: Role.ADMINISTRADOR },
    });
    await expect(service.updateUserStatus(1, true, 1)).resolves.toBe(true);
  });
});

describe('DTOs de estado y contrasena', () => {
  it.each([
    ['UpdateUserStatusDto', UpdateUserStatusDto, 'estado'],
    ['UpdateServiceStatusDto', UpdateServiceStatusDto, 'status'],
  ])('%s exige un booleano real', (_n, cls, field) => {
    const check = (body: object) =>
      validateSync(plainToInstance(cls as any, body));

    expect(check({})).not.toHaveLength(0);
    expect(check({ [field]: 'true' })).not.toHaveLength(0);
    expect(check({ [field]: 1 })).not.toHaveLength(0);
    expect(check({ [field]: null })).not.toHaveLength(0);
    expect(check({ [field]: false })).toHaveLength(0);
    expect(check({ [field]: true })).toHaveLength(0);
  });

  const base = {
    name: 'A',
    lastname: 'B',
    phone: '5551234567',
    email: 'a@b.co',
    role: Role.ADMINISTRADOR,
  };

  it('create-user exige contrasena de al menos 10 caracteres', () => {
    const short = validateSync(
      plainToInstance(CreateUserDto, { ...base, password: '123456789' }),
    );
    const ok = validateSync(
      plainToInstance(CreateUserDto, { ...base, password: '1234567890' }),
    );

    expect(short.some((e) => e.property === 'password')).toBe(true);
    expect(ok).toHaveLength(0);
  });

  it('telefono de usuario y de emergencia exigen 10 a 15 digitos', () => {
    const bad = (phone: string) =>
      validateSync(
        plainToInstance(CreateUserDto, {
          ...base,
          phone,
          password: '1234567890',
        }),
      ).some((e) => e.property === 'phone');
    expect(bad('123456789')).toBe(true);
    expect(bad('1234567890123456')).toBe(true);
    expect(bad('(55) 1234-5678')).toBe(false);
    expect(bad('+52 55 1234 5678')).toBe(false);
    expect(bad('1111111111')).toBe(false);
    const ep = (emergency_phone: string) =>
      validateSync(
        plainToInstance(CreatePatientDto, {
          address: 'x',
          birth_date: '2000-01-01',
          emergency_phone,
        }),
      ).some((e) => e.property === 'emergency_phone');
    expect(ep('123')).toBe(true);
    expect(ep('5551234567')).toBe(false);
  });

  it('register exige contrasena de al menos 10 caracteres', () => {
    const { role: _role, ...noRole } = base;
    const errors = validateSync(
      plainToInstance(RegisterUserDto, { ...noRole, password: '123456789' }),
    );
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('user_id no es aceptado desde el cliente (whitelist lo descarta)', () => {
    const dto = plainToInstance(CreatePatientDto, {
      address: 'x',
      birth_date: '2000-01-01',
      emergency_phone: '1',
      user_id: 99,
    });
    validateSync(dto, { whitelist: true });
    expect(dto.user_id).toBeUndefined();
  });
});

describe('UsersService.createUser - auditoria', () => {
  const tx = { marker: 'tx' };
  let users: any;
  let patients: any;
  let audit: any;
  let service: UsersService;

  const baseDto = {
    name: 'A',
    lastname: 'B',
    email: 'a@b.co',
    phone: '1',
    password: 'contrasena-larga-1',
  };

  beforeEach(() => {
    users = {
      emailExists: jest.fn().mockResolvedValue(false),
      phoneExists: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue({
        id: 12,
        status: true,
        role: { role: Role.ASISTENTE },
      }),
    };
    patients = { create: jest.fn() };
    audit = { log: jest.fn() };
    const prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new UsersService(users, patients, prisma as any, audit);
  });

  it('audita la creacion con el admin como actor y sin contrasena ni correo', async () => {
    await service.createUser({ ...baseDto, role: Role.ASISTENTE } as any, 1);

    const [entry, usedTx] = audit.log.mock.calls[0];
    expect(entry).toEqual({
      userId: 1,
      action: 'USER_CREATED',
      entity: 'USER',
      entityId: 12,
      after: { role: Role.ASISTENTE, status: true },
    });
    expect(usedTx).toBe(tx);
    expect(users.create.mock.calls[0][1]).toBe(tx);
  });

  it('en el registro publico el actor es el propio usuario', async () => {
    users.create.mockResolvedValue({
      id: 30,
      status: true,
      role: { role: Role.PACIENTE },
    });
    await service.createUser({
      ...baseDto,
      role: Role.PACIENTE,
      patient: { address: 'x', birth_date: '2000-01-01' },
    } as any);

    expect(patients.create).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 30 }),
      tx,
    );
    expect(audit.log.mock.calls[0][0].userId).toBe(30);
  });

  it('paciente sin datos de paciente falla antes de tocar la BD', async () => {
    await expect(
      service.createUser({ ...baseDto, role: Role.PACIENTE } as any),
    ).rejects.toThrow(BadRequestException);
    expect(users.create).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });
});
