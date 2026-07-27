import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {

        const allowedRoles = this.reflector.getAllAndOverride(Roles, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!allowedRoles || allowedRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userRole = request.user?.role;

        if (!allowedRoles.includes(userRole)) {
            throw new ForbiddenException('No tienes permisos para acceder a este recurso');
        }

        return true;
    }
}
