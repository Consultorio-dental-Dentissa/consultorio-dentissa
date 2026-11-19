import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthRequest } from '../auth-request';
import { Role } from '../../../modules/users/enums/rol.enum';

/**
 * Debe ejecutarse después de AuthGuard e IsActiveUserGuard, ya que
 * depende de request.user. Si el endpoint no declara @Roles(), solo
 * exige estar autenticado. Si es público, no aplica.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      targets,
    );

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      targets,
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const role = request.user?.role as Role | undefined;

    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta acción',
      );
    }

    return true;
  }
}
