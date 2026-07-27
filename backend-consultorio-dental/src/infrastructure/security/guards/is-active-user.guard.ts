import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Public } from '../decorators/public.decorator';

@Injectable()
export class IsActiveUserGuard implements CanActivate {

    constructor(
        private readonly repository: PrismaService,
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext) {

        const isPublic = this.reflector.getAllAndOverride(Public, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const status = await this.repository.user.count({
            where: {
                id: request.user.id,
                status: true
            }
        })

        if (!status) {
            throw new UnauthorizedException('No tienes permitido acceder a este recurso');
        }

        return true;
    }
}
