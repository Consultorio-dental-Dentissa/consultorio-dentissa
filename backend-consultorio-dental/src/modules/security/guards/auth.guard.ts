import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private jwtService: JwtService,
        // private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        try {

            /*
            // Evaluamos si el endpoint que potege el guarda es publico
            const es_publico = this.reflector.get(Public, context.getHandler());
            if (es_publico) {

            }
            */

            const request = context.switchToHttp().getRequest();
            const token = request.headers.authorization.split(' ')[1];

            if (!token) {
                throw new UnauthorizedException();
            }

            const payload = await this.jwtService.verifyAsync(token);
            request.usuario = payload;

            return true;

        } catch (error) {
            throw new UnauthorizedException('No tienes permitido entrar');
        }

    }
}
