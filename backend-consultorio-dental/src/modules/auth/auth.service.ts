import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/rol.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(credentials: LoginDto, response: Response) {

        const user = await this.usersService.getUserByEmailWithPassword(credentials.email);
        const isCorrectPassword = await bcrypt.compare(credentials.password, user?.password ?? '');

        if (!user || !isCorrectPassword) {
            throw new NotFoundException('Las credenciales son incorrectas');
        }

        if (!user.status) {
            throw new UnauthorizedException('Tu cuenta ha sido desactivada');
        }
        
        const payload = {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            role: user.role.role,
            status: user.status
        };

        const token = await this.createToken(payload);

        response.cookie('access_token', token, this.getCookieOptions());


        const loggedUser = {
            logged: true,
            user: {
                id: user.id,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                role: user.role.role,
            }
        }

        return loggedUser;
    }

    async logout(response: Response) {
        response.clearCookie('access_token', this.getCookieOptions());
    }


    async createToken(payload) {
        return await this.jwtService.signAsync(payload);
    }

    /**
     * INDICACIÓN:
     * Frontend y backend viven en dominios distintos en producción,
     * por lo que la cookie necesita SameSite=None + Secure para que
     * el navegador la acepte y la reenvíe en peticiones cross-site.
     * En desarrollo (HTTP, sin dominios distintos) eso rompe el flujo,
     * así que se alterna según ON_PRODUCTION.
     */
    private getCookieOptions() {
        const isProduction = process.env.ON_PRODUCTION === 'true';

        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' as const : 'lax' as const,
            maxAge: 3600000,
        };
    }


    async registerUser(user: RegisterUserDto) {

        /**
         * INDICACIÓN:
         * Definimos el rol de PACIENTE para este metodo
         * para que el objeto pueda ser recibido como tipo:
         * CreateUserDto
         */
        const patientUser = {
            ...user,
            role: Role.PACIENTE
        }

        return await this.usersService.createUser(patientUser);
    }
}
