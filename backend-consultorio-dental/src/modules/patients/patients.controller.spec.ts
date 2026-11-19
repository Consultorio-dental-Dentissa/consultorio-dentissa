import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { PacientesController } from './patients.controller';
import { Role } from '../users/enums/rol.enum';

function contextFor(handler: Function, role: string): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => PacientesController,
    switchToHttp: () => ({ getRequest: () => ({ user: { id: 1, role } }) }),
  } as unknown as ExecutionContext;
}

describe('PacientesController - permisos', () => {
  const guard = new RolesGuard(new Reflector());
  const proto = PacientesController.prototype;

  it('un PACIENTE no puede listar pacientes', () => {
    expect(() =>
      guard.canActivate(contextFor(proto.get, Role.PACIENTE)),
    ).toThrow(ForbiddenException);
  });

  it('ADMIN y ASISTENTE pueden listar pacientes', () => {
    expect(guard.canActivate(contextFor(proto.get, Role.ADMINISTRADOR))).toBe(
      true,
    );
    expect(guard.canActivate(contextFor(proto.get, Role.ASISTENTE))).toBe(true);
  });

  it('un PACIENTE llega al detalle (la propiedad se valida en el service)', () => {
    expect(guard.canActivate(contextFor(proto.getById, Role.PACIENTE))).toBe(
      true,
    );
  });
});
