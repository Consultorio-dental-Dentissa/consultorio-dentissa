import 'reflect-metadata';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { ROLES_KEY } from 'src/infrastructure/security/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';
import { Role } from './enums/rol.enum';

describe('UsersService.updateUser (PATCH /users/:id)', () => {
  const tx = { marker: 'tx' };
  let users: any;
  let prisma: any;
  let audit: any;
  let service: UsersService;

  const current = (over: Record<string, unknown> = {}) => ({
    id: 5,
    name: 'Ana',
    lastname: 'Perez',
    email: 'ana@example.com',
    phone: '5511112222',
    status: true,
    role: { role: Role.ASISTENTE },
    ...over,
  });

  beforeEach(() => {
    users = {
      lockById: jest.fn(),
      getForUpdate: jest.fn().mockResolvedValue(current()),
      isEmailTakenByOther: jest.fn().mockResolvedValue(false),
      isPhoneTakenByOther: jest.fn().mockResolvedValue(false),
      countActiveAdmins: jest.fn().mockResolvedValue(2),
      findRoleId: jest.fn().mockResolvedValue(1),
      applyUpdate: jest.fn(),
      revokeRefreshTokens: jest.fn(),
      invalidateResetTokens: jest.fn(),
      getById: jest.fn().mockResolvedValue({ id: 5 }),
      getPasswordHash: jest
        .fn()
        .mockResolvedValue(bcrypt.hashSync('Clave123', 4)),
    };
    prisma = { $transaction: jest.fn((work: any) => work(tx)) };
    audit = { log: jest.fn() };
    service = new UsersService(users, {} as any, prisma, audit);
  });

  it('sin campos: 400 y sin transaccion', async () => {
    await expect(service.updateUser(5, {}, 1)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  describe('cambio de correo en la propia cuenta', () => {
    it('sin current_password: 400 y sin escritura', async () => {
      await expect(
        service.updateUser(5, { email: 'otro@example.com' }, 5),
      ).rejects.toThrow('Ingresa tu contraseña actual');
      expect(users.applyUpdate).not.toHaveBeenCalled();
    });

    it('contraseña incorrecta: 400 y sin escritura', async () => {
      await expect(
        service.updateUser(
          5,
          { email: 'otro@example.com', current_password: 'mala' },
          5,
        ),
      ).rejects.toThrow('La contraseña actual es incorrecta');
      expect(users.applyUpdate).not.toHaveBeenCalled();
    });

    it('contraseña correcta: cambia el correo, no guarda ni audita la contraseña', async () => {
      await service.updateUser(
        5,
        { email: 'otro@example.com', current_password: 'Clave123' },
        5,
      );
      expect(users.applyUpdate).toHaveBeenCalledWith(
        5,
        { email: 'otro@example.com' },
        tx,
      );
      expect(JSON.stringify(audit.log.mock.calls)).not.toContain('Clave123');
      expect(audit.log.mock.calls[0][0].after).toEqual({
        changedFields: ['email'],
      });
    });

    it('mismo correo (otra capitalizacion): no pide contraseña', async () => {
      await service.updateUser(5, { email: 'ANA@example.com', name: 'Z' }, 5);
      expect(users.getPasswordHash).not.toHaveBeenCalled();
    });

    it('editar a OTRO usuario no pide contraseña', async () => {
      await service.updateUser(5, { email: 'otro@example.com' }, 1);
      expect(users.getPasswordHash).not.toHaveBeenCalled();
      expect(users.applyUpdate).toHaveBeenCalled();
    });
  });

  it('404 si no existe', async () => {
    users.getForUpdate.mockResolvedValue(null);
    await expect(service.updateUser(9, { name: 'X' }, 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('bloquea la fila, actualiza y audita solo changedFields (sin valores)', async () => {
    await service.updateUser(
      5,
      { name: 'Nuevo', phone: '5599998888', email: 'nuevo@example.com' },
      1,
    );
    expect(users.lockById).toHaveBeenCalledWith(5, tx);
    expect(users.applyUpdate).toHaveBeenCalledWith(
      5,
      { name: 'Nuevo', phone: '5599998888', email: 'nuevo@example.com' },
      tx,
    );
    const [entry, usedTx] = audit.log.mock.calls[0];
    expect(entry).toEqual({
      userId: 1,
      action: 'USER_UPDATED',
      entity: 'USER',
      entityId: 5,
      after: { changedFields: ['name', 'email', 'phone'] },
    });
    expect(JSON.stringify(entry)).not.toContain('nuevo@example.com');
    expect(JSON.stringify(entry)).not.toContain('5599998888');
    expect(usedTx).toBe(tx);
  });

  it('sin cambios reales: sin escritura ni auditoria', async () => {
    await service.updateUser(
      5,
      { name: 'Ana', email: 'ANA@example.com', role: Role.ASISTENTE },
      1,
    );
    expect(users.applyUpdate).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
    expect(users.revokeRefreshTokens).not.toHaveBeenCalled();
  });

  it('correo duplicado: 400 y sin escritura', async () => {
    users.isEmailTakenByOther.mockResolvedValue(true);
    await expect(
      service.updateUser(5, { email: 'otro@example.com' }, 1),
    ).rejects.toThrow('Este correo ya esta registrado');
    expect(users.applyUpdate).not.toHaveBeenCalled();
  });

  it('telefono duplicado: 400 y sin escritura', async () => {
    users.isPhoneTakenByOther.mockResolvedValue(true);
    await expect(
      service.updateUser(5, { phone: '5500000000' }, 1),
    ).rejects.toThrow('Este telefono ya esta registrado');
    expect(users.applyUpdate).not.toHaveBeenCalled();
  });

  it('cambio de correo revoca refresh tokens e invalida tokens de reset', async () => {
    await service.updateUser(5, { email: 'nuevo@example.com' }, 1);
    expect(users.revokeRefreshTokens).toHaveBeenCalledWith(5, tx);
    expect(users.invalidateResetTokens).toHaveBeenCalledWith(5, tx);
  });

  it('cambio de nombre/telefono NO revoca sesiones', async () => {
    await service.updateUser(5, { name: 'Otro', phone: '5500000001' }, 1);
    expect(users.revokeRefreshTokens).not.toHaveBeenCalled();
    expect(users.invalidateResetTokens).not.toHaveBeenCalled();
  });

  it('cambio de rol ASISTENTE -> ADMIN revoca refresh tokens e invalida access tokens', async () => {
    await service.updateUser(5, { role: Role.ADMINISTRADOR }, 1);
    expect(users.revokeRefreshTokens).toHaveBeenCalledWith(5, tx);
    expect(users.invalidateResetTokens).not.toHaveBeenCalled();
    const data = users.applyUpdate.mock.calls[0][1];
    expect(data.role_id).toBe(1);
    expect(data.password_changed_at).toBeInstanceOf(Date);
    expect(audit.log.mock.calls[0][0].after).toEqual({
      changedFields: ['role'],
    });
  });

  it('un PACIENTE no puede cambiar a otro rol (400)', async () => {
    users.getForUpdate.mockResolvedValue(
      current({ role: { role: Role.PACIENTE } }),
    );
    await expect(
      service.updateUser(5, { role: Role.ASISTENTE }, 1),
    ).rejects.toThrow(BadRequestException);
    expect(users.applyUpdate).not.toHaveBeenCalled();
  });

  it('nadie puede pasar a PACIENTE (400)', async () => {
    await expect(
      service.updateUser(5, { role: Role.PACIENTE }, 1),
    ).rejects.toThrow(BadRequestException);
  });

  it('un PACIENTE si puede editar sus datos sin tocar su rol', async () => {
    users.getForUpdate.mockResolvedValue(
      current({ role: { role: Role.PACIENTE } }),
    );
    await service.updateUser(5, { name: 'Nueva', role: Role.PACIENTE }, 1);
    expect(users.applyUpdate).toHaveBeenCalledWith(5, { name: 'Nueva' }, tx);
  });

  it('un ADMIN no puede quitarse a si mismo el rol ADMINISTRADOR (403)', async () => {
    users.getForUpdate.mockResolvedValue(
      current({ id: 1, role: { role: Role.ADMINISTRADOR } }),
    );
    await expect(
      service.updateUser(1, { role: Role.ASISTENTE }, 1),
    ).rejects.toThrow(ForbiddenException);
    expect(users.applyUpdate).not.toHaveBeenCalled();
  });

  it('no se degrada al ultimo ADMIN activo (400)', async () => {
    users.getForUpdate.mockResolvedValue(
      current({ id: 2, role: { role: Role.ADMINISTRADOR } }),
    );
    users.countActiveAdmins.mockResolvedValue(1);
    await expect(
      service.updateUser(2, { role: Role.ASISTENTE }, 1),
    ).rejects.toThrow('ultimo administrador activo');
    expect(users.applyUpdate).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('degradar a un ADMIN cuando hay otro activo si se permite', async () => {
    users.getForUpdate.mockResolvedValue(
      current({ id: 2, role: { role: Role.ADMINISTRADOR } }),
    );
    users.countActiveAdmins.mockResolvedValue(2);
    await service.updateUser(2, { role: Role.ASISTENTE }, 1);
    expect(users.applyUpdate).toHaveBeenCalled();
  });

  it('degradar a un ADMIN inactivo no depende del conteo de activos', async () => {
    users.getForUpdate.mockResolvedValue(
      current({ id: 2, status: false, role: { role: Role.ADMINISTRADOR } }),
    );
    users.countActiveAdmins.mockResolvedValue(1);
    await service.updateUser(2, { role: Role.ASISTENTE }, 1);
    expect(users.applyUpdate).toHaveBeenCalled();
  });

  it('la transaccion es Serializable', async () => {
    await service.updateUser(5, { name: 'Z' }, 1);
    expect(prisma.$transaction.mock.calls[0][1].isolationLevel).toBe(
      'Serializable',
    );
  });
});

describe('UpdateUserDto', () => {
  const validate = (plain: object) =>
    validateSync(plainToInstance(UpdateUserDto, plain)).map(
      (e) => Object.values(e.constraints ?? {})[0],
    );

  it('acepta un body parcial valido y normaliza correo/telefono', () => {
    const dto = plainToInstance(UpdateUserDto, {
      email: '  ANA@Example.COM ',
      phone: '(55) 1111-2222',
    });
    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.email).toBe('ana@example.com');
    expect(dto.phone).toBe('5511112222');
  });

  it('rechaza telefono, correo y rol invalidos con mensajes en español', () => {
    expect(validate({ phone: '123' })).toContain(
      'El teléfono debe tener entre 10 y 15 dígitos',
    );
    expect(validate({ email: 'x' })).toContain(
      'El correo no esta en formato valido',
    );
    expect(validate({ role: 'ROOT' })).toContain('El rol no es válido');
  });

  it('rechaza null y vacios', () => {
    expect(validate({ name: null }).length).toBeGreaterThan(0);
    expect(validate({ name: '   ' })).toContain(
      'El nombre no puede estar vacío',
    );
  });
});

describe('UsersController PATCH /users/:id', () => {
  it('es solo ADMINISTRADOR', () => {
    expect(Reflect.getMetadata(ROLES_KEY, UsersController)).toEqual([
      Role.ADMINISTRADOR,
    ]);
    expect(
      Reflect.getMetadata(ROLES_KEY, UsersController.prototype.updateUser),
    ).toBeUndefined();
  });
});
