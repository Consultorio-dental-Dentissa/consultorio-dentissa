import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';
import { Role } from '../../../modules/users/enums/rol.enum';

class SampleController {
  @Roles(Role.ADMINISTRADOR)
  adminOnly() {}

  @Roles(Role.ADMINISTRADOR, Role.ASISTENTE)
  adminOrAssistant() {}

  noRoles() {}

  @Public()
  @Roles(Role.ADMINISTRADOR)
  publicRoute() {}
}

function contextFor(
  handler: Function,
  user?: { role: string },
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => SampleController,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());
  const proto = SampleController.prototype;

  it('permite el acceso si el rol del usuario esta autorizado', () => {
    expect(
      guard.canActivate(
        contextFor(proto.adminOnly, { role: Role.ADMINISTRADOR }),
      ),
    ).toBe(true);
    expect(
      guard.canActivate(
        contextFor(proto.adminOrAssistant, { role: Role.ASISTENTE }),
      ),
    ).toBe(true);
  });

  it('rechaza con 403 si el rol no esta autorizado', () => {
    expect(() =>
      guard.canActivate(contextFor(proto.adminOnly, { role: Role.PACIENTE })),
    ).toThrow(ForbiddenException);
    expect(() =>
      guard.canActivate(
        contextFor(proto.adminOrAssistant, { role: Role.PACIENTE }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('rechaza si no hay usuario en la peticion', () => {
    expect(() => guard.canActivate(contextFor(proto.adminOnly))).toThrow(
      ForbiddenException,
    );
  });

  it('solo exige autenticacion cuando no hay @Roles()', () => {
    expect(
      guard.canActivate(contextFor(proto.noRoles, { role: Role.PACIENTE })),
    ).toBe(true);
  });

  it('no aplica en rutas publicas', () => {
    expect(guard.canActivate(contextFor(proto.publicRoute))).toBe(true);
  });
});
