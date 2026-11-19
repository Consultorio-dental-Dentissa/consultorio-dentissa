import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthRequest } from '../auth-request';
import { isIssuedBeforePasswordChange } from '../token-validity';

@Injectable()
export class IsActiveUserGuard implements CanActivate {
  constructor(
    private readonly repository: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = await this.repository.user.findFirst({
      where: {
        id: request.user?.id,
        status: true,
      },
      select: { password_changed_at: true },
    });

    // Un access token emitido antes del ultimo cambio de contraseña ya no vale.
    if (
      !user ||
      isIssuedBeforePasswordChange(request.user?.iat, user.password_changed_at)
    ) {
      throw new UnauthorizedException(
        'No tienes permitido acceder a este recurso',
      );
    }

    return true;
  }
}
