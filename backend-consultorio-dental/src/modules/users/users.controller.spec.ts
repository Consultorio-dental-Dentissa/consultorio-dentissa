import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { UsersController } from './users.controller';
import { Role } from './enums/rol.enum';

function contextFor(handler: Function, role: string): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => UsersController,
    switchToHttp: () => ({ getRequest: () => ({ user: { id: 1, role } }) }),
  } as unknown as ExecutionContext;
}

describe('UsersController - permisos', () => {
  const guard = new RolesGuard(new Reflector());
  const proto = UsersController.prototype;

  it.each([
    ['crear usuarios', proto.post],
    ['listar usuarios', proto.get],
    ['ver un usuario', proto.getById],
    ['cambiar estado', proto.updateUserStatus],
  ])('un PACIENTE no puede %s', (_name, handler) => {
    expect(() => guard.canActivate(contextFor(handler, Role.PACIENTE))).toThrow(
      ForbiddenException,
    );
  });

  it('un ASISTENTE no puede crear usuarios', () => {
    expect(() =>
      guard.canActivate(contextFor(proto.post, Role.ASISTENTE)),
    ).toThrow(ForbiddenException);
  });

  it('un ADMINISTRADOR puede crear usuarios', () => {
    expect(guard.canActivate(contextFor(proto.post, Role.ADMINISTRADOR))).toBe(
      true,
    );
  });
});
