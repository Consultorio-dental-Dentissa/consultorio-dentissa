import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        try {
            const request = context.switchToHttp().getRequest();
            const token = request.headers.authorization.split(' ')[1];

            if (!token) {
                throw new UnauthorizedException('No tienes token');
            }

            const payload = await this.jwtService.verifyAsync(token);
            request.usuario = payload;

            return true;

        } catch (error) {
            throw new UnauthorizedException(error.message ? error.message : 'No tienes permitido entrar');
        }

    }
}
