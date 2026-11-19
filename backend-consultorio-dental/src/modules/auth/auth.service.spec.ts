import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';

jest.mock('bcrypt', () => {
  const actual = jest.requireActual('bcrypt');
  return { ...actual, compare: jest.fn(actual.compare) };
});

describe('AuthService', () => {
  const tx = { tx: true };
  const activeUser = {
    id: 1,
    name: 'A',
    lastname: 'B',
    email: 'a@b.c',
    phone: '1',
    status: true,
    role: { role: 'PACIENTE' },
  };
  const future = new Date(Date.now() + 60_000);

  let usersService: any;
  let jwtService: any;
  let refreshRepo: any;
  let prisma: any;
  let service: AuthService;
  const response: any = { cookie: jest.fn(), clearCookie: jest.fn() };

  beforeEach(() => {
    usersService = {
      getUserByEmailWithPassword: jest.fn(),
      getUserById: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('jwt') };
    refreshRepo = {
      findByHash: jest.fn(),
      revokeIfValid: jest.fn().mockResolvedValue(true),
      revokeAllForUser: jest.fn(),
      create: jest.fn(),
    };
    prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    response.cookie.mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
    service = new AuthService(
      usersService,
      jwtService,
      refreshRepo,
      {} as any,
      {} as any,
      prisma,
      {} as any,
      { log: jest.fn() } as any,
    );
  });

  describe('login', () => {
    it('usuario inexistente responde 401', async () => {
      usersService.getUserByEmailWithPassword.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@y.z', password: 'p' } as any, response),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('usuario inexistente compara contra un hash bcrypt valido (igualar tiempos)', async () => {
      usersService.getUserByEmailWithPassword.mockResolvedValue(null);
      await service
        .login({ email: 'x@y.z', password: 'p' } as any, response)
        .catch(() => undefined);

      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      const hash = (bcrypt.compare as jest.Mock).mock.calls[0][1] as string;
      expect(hash).toMatch(/^\$2[aby]\$10\$.{53}$/);
    });

    it('contrasena incorrecta responde 401', async () => {
      usersService.getUserByEmailWithPassword.mockResolvedValue({
        ...activeUser,
        password: await bcrypt.hash('correcta', 4),
      });
      await expect(
        service.login({ email: 'x@y.z', password: 'mala' } as any, response),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    const req = { cookies: { refresh_token: 'tok' } } as any;

    it('sin cookie responde 401', async () => {
      await expect(
        service.refresh({ cookies: {} } as any, response),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('token desconocido responde 401 sin revocar sesiones', async () => {
      refreshRepo.findByHash.mockResolvedValue(null);
      await expect(service.refresh(req, response)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshRepo.revokeAllForUser).not.toHaveBeenCalled();
    });

    it('token ya revocado (reutilizacion) revoca todas las sesiones del usuario y responde 401', async () => {
      refreshRepo.findByHash.mockResolvedValue({
        id: 3,
        user_id: 1,
        revoked_at: new Date(),
        expires_at: future,
      });
      await expect(service.refresh(req, response)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshRepo.revokeAllForUser).toHaveBeenCalledWith(1);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(refreshRepo.create).not.toHaveBeenCalled();
    });

    it('token vencido responde 401 sin revocar todas las sesiones', async () => {
      refreshRepo.findByHash.mockResolvedValue({
        id: 3,
        user_id: 1,
        revoked_at: null,
        expires_at: new Date(Date.now() - 1000),
      });
      await expect(service.refresh(req, response)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshRepo.revokeAllForUser).not.toHaveBeenCalled();
    });

    it('falla si el usuario fue desactivado', async () => {
      refreshRepo.findByHash.mockResolvedValue({
        id: 3,
        user_id: 1,
        revoked_at: null,
        expires_at: future,
      });
      usersService.getUserById.mockResolvedValue({
        ...activeUser,
        status: false,
      });

      await expect(service.refresh(req, response)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rota de forma atomica: revoca y crea el nuevo token en la misma transaccion', async () => {
      refreshRepo.findByHash.mockResolvedValue({
        id: 3,
        user_id: 1,
        revoked_at: null,
        expires_at: future,
      });
      usersService.getUserById.mockResolvedValue(activeUser);

      await expect(service.refresh(req, response)).resolves.toEqual({
        refreshed: true,
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(refreshRepo.revokeIfValid).toHaveBeenCalledWith(3, tx);
      expect(refreshRepo.create.mock.calls[0][3]).toBe(tx);
      expect(response.cookie).toHaveBeenCalledTimes(2);
    });

    it('carrera (revokeIfValid false con token existente): no emite cookies, revoca todas y responde 401', async () => {
      refreshRepo.findByHash.mockResolvedValue({
        id: 3,
        user_id: 1,
        revoked_at: null,
        expires_at: future,
      });
      usersService.getUserById.mockResolvedValue(activeUser);
      refreshRepo.revokeIfValid.mockResolvedValue(false);

      await expect(service.refresh(req, response)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshRepo.create).not.toHaveBeenCalled();
      expect(response.cookie).not.toHaveBeenCalled();
      expect(refreshRepo.revokeAllForUser).toHaveBeenCalledWith(1);
    });
  });
});

describe('RefreshTokensRepository.revokeIfValid', () => {
  it('es atomico: updateMany condicional y true solo si count === 1', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new RefreshTokensRepository({
      refreshToken: { updateMany },
    } as any);

    await expect(repository.revokeIfValid(3)).resolves.toBe(true);
    const where = updateMany.mock.calls[0][0].where;
    expect(where.id).toBe(3);
    expect(where.revoked_at).toBeNull();
    expect(where.expires_at.gt).toBeInstanceOf(Date);

    updateMany.mockResolvedValue({ count: 0 });
    await expect(repository.revokeIfValid(3)).resolves.toBe(false);
  });
});
