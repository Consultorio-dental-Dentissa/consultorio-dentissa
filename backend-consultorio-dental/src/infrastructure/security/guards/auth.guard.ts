import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private jwtService: JwtService,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const isPublic = this.reflector.getAllAndOverride(Public, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        try {
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
