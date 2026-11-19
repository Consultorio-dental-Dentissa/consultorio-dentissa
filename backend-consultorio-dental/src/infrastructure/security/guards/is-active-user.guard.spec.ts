import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IsActiveUserGuard } from './is-active-user.guard';

function ctx(user: Record<string, unknown>) {
  return {
    getHandler: () => ctx,
    getClass: () => IsActiveUserGuard,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('IsActiveUserGuard', () => {
  let prisma: { user: { findFirst: jest.Mock } };
  let guard: IsActiveUserGuard;

  beforeEach(() => {
    prisma = { user: { findFirst: jest.fn() } };
    guard = new IsActiveUserGuard(prisma as any, new Reflector());
  });

  it('acepta usuario activo sin cambio de contraseña', async () => {
    prisma.user.findFirst.mockResolvedValue({ password_changed_at: null });
    await expect(guard.canActivate(ctx({ id: 1, iat: 100 }))).resolves.toBe(
      true,
    );
  });

  it('rechaza usuario inactivo o inexistente', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(guard.canActivate(ctx({ id: 1, iat: 100 }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza un token emitido antes del cambio de contraseña', async () => {
    prisma.user.findFirst.mockResolvedValue({
      password_changed_at: new Date(200_000),
    });
    await expect(guard.canActivate(ctx({ id: 1, iat: 100 }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('acepta un token emitido despues del cambio de contraseña', async () => {
    prisma.user.findFirst.mockResolvedValue({
      password_changed_at: new Date(200_000),
    });
    await expect(guard.canActivate(ctx({ id: 1, iat: 201 }))).resolves.toBe(
      true,
    );
  });
});
