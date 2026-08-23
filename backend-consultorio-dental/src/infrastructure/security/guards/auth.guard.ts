import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private jwtService: JwtService,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        try {

            /**
             * INDICACIÓN:
             * Evaluamos si el endpoint que protege el guard es publico
             */

            const isPublic = this.reflector.getAllAndOverride<boolean>(
                IS_PUBLIC_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ]
            );

            if (isPublic) {
                return true;
            }

            // Si no lo es, validamos el token
            const request = context.switchToHttp().getRequest();
            const token = request.cookies['access_token'];

            if (!token) {
                throw new UnauthorizedException();
            }

            const payload = await this.jwtService.verifyAsync(token);
            request.user = payload;

            return true;

        } catch (error) {
            throw new UnauthorizedException('No tienes permitido realizar esta acción');
        }

    }
}
