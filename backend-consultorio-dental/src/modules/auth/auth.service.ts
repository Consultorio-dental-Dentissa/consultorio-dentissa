import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/rol.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import type { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';

const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutos
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private refreshTokensRepository: RefreshTokensRepository
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

        await this.issueTokens(user, response);

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

    async refresh(request: Request, response: Response) {

        const refreshToken = request.cookies['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('No tienes permitido realizar esta acción');
        }

        const storedToken = await this.refreshTokensRepository.findValidByHash(this.hashToken(refreshToken));

        if (!storedToken) {
            throw new UnauthorizedException('No tienes permitido realizar esta acción');
        }

        /**
         * Rotación: el refresh token usado queda invalidado de inmediato,
         * asi si alguien lo reutiliza (por ejemplo, porque fue robado), ya no sirve.
         */
        await this.refreshTokensRepository.revoke(storedToken.id);

        const user = await this.usersService.getUserById(storedToken.user_id);

        await this.issueTokens(user, response);

        return { refreshed: true };
    }

    async logout(request: Request, response: Response) {

        const refreshToken = request.cookies['refresh_token'];

        if (refreshToken) {
            await this.refreshTokensRepository.revokeByHash(this.hashToken(refreshToken));
        }

        response.clearCookie('access_token', {
            httpOnly: true,
            secure: false,
        });

        response.clearCookie('refresh_token', {
            httpOnly: true,
            secure: false,
            path: '/auth',
        });

        return { loggedOut: true };
        
    }


    async createToken(payload) {
        return await this.jwtService.signAsync(payload, {
            expiresIn: ACCESS_TOKEN_EXPIRY_MS / 1000
        });
    }

    private async issueTokens(user, response: Response) {

        const payload = {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            role: user.role.role,
            status: user.status
        };

        const accessToken = await this.createToken(payload);
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

        await this.refreshTokensRepository.create(user.id, this.hashToken(refreshToken), refreshTokenExpiresAt);

        response.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: ACCESS_TOKEN_EXPIRY_MS,
        });

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: REFRESH_TOKEN_EXPIRY_MS,
            path: '/auth',
        });
    }

    private hashToken(token: string) {
        return crypto.createHash('sha256').update(token).digest('hex');
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
