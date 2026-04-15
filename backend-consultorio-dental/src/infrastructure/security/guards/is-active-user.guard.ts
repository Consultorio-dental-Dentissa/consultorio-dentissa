import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class IsActiveUserGuard implements CanActivate {

    constructor(private readonly repositorio: PrismaService) {}

    async canActivate(context: ExecutionContext) {

        const request = context.switchToHttp().getRequest();
        const status = await this.repositorio.user.count({
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
