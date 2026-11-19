import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { Public } from '../decorators/public.decorator';

class Sample {
  @Public()
  publicRoute() {}
}

function contextFor(request: Record<string, unknown>) {
  return {
    getHandler: () => Sample.prototype.publicRoute,
    getClass: () => Sample,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard - rutas @Public', () => {
  let jwt: { verifyAsync: jest.Mock };
  let prisma: { user: { findFirst: jest.Mock } };
  let guard: AuthGuard;

  beforeEach(() => {
    jwt = {
      verifyAsync: jest.fn().mockResolvedValue({ id: 7, role: 'ADMIN' }),
    };
    prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ password_changed_at: null }),
      },
    };
    guard = new AuthGuard(jwt as any, new Reflector(), prisma as any);
  });

  it('adjunta el usuario si el token es valido y el usuario esta activo', async () => {
    const request: Record<string, unknown> = { cookies: { access_token: 't' } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toEqual({ id: 7, role: 'ADMIN' });
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 7, status: true },
      select: { password_changed_at: true },
    });
  });

  it('descarta request.user si el usuario del token esta inactivo', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    const request: Record<string, unknown> = { cookies: { access_token: 't' } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('descarta request.user si el token se emitio antes del cambio de contraseña', async () => {
    jwt.verifyAsync.mockResolvedValue({ id: 7, role: 'ADMIN', iat: 100 });
    prisma.user.findFirst.mockResolvedValue({
      password_changed_at: new Date(200 * 1000),
    });
    const request: Record<string, unknown> = { cookies: { access_token: 't' } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('trata como anonimo un token invalido', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('bad'));
    const request: Record<string, unknown> = { cookies: { access_token: 't' } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });
});
