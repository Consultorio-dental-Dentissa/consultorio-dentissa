import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import type { AuthRequest, AuthUser } from '../auth-request';
import { isIssuedBeforePasswordChange } from '../token-validity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      /**
       * INDICACIÓN:
       * Evaluamos si el endpoint que protege el guard es publico
       */

      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (isPublic) {
        /**
         * En rutas públicas, si viene un token válido se adjunta el usuario
         * (para que el endpoint pueda distinguir a un ADMIN); si no, se ignora.
         */
        const publicRequest = context.switchToHttp().getRequest<AuthRequest>();
        const publicToken = (
          publicRequest.cookies as Record<string, string> | undefined
        )?.['access_token'];

        if (publicToken) {
          try {
            const payload =
              await this.jwtService.verifyAsync<AuthUser>(publicToken);

            /**
             * El token puede seguir siendo valido aunque el usuario haya sido
             * desactivado: solo se adjunta si sigue activo en la BD.
             */
            const dbUser = await this.prisma.user.findFirst({
              where: { id: payload.id, status: true },
              select: { password_changed_at: true },
            });

            if (
              dbUser &&
              !isIssuedBeforePasswordChange(
                payload.iat,
                dbUser.password_changed_at,
              )
            ) {
              publicRequest.user = payload;
            }
          } catch {
            // Token inválido o vencido: se trata como visitante anónimo
          }
        }

        return true;
      }

      // Si no lo es, validamos el token
      const request = context.switchToHttp().getRequest<AuthRequest>();
      const token = (request.cookies as Record<string, string> | undefined)?.[
        'access_token'
      ];

      if (!token) {
        throw new UnauthorizedException();
      }

      request.user = await this.jwtService.verifyAsync<AuthUser>(token);

      return true;
    } catch {
      throw new UnauthorizedException(
        'No tienes permitido realizar esta acción',
      );
    }
  }
}
