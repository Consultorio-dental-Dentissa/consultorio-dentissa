import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/rol.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { PasswordResetTokensRepository } from './repositories/password-reset-tokens.repository';
import { CredentialsRepository } from './repositories/credentials.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { baseCookieOptions } from './auth-cookies';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/audit.constants';

const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutos
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const RESET_TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutos
const BCRYPT_ROUNDS = 10;

/**
 * Hash bcrypt valido generado una sola vez al arrancar. Se compara contra el
 * cuando el usuario no existe para igualar el tiempo de respuesta del login.
 */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  crypto.randomBytes(16).toString('hex'),
  BCRYPT_ROUNDS,
);

export const FORGOT_PASSWORD_MESSAGE =
  'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña';

interface TokenUser {
  id: number;
  role: { role: string };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokensRepository: RefreshTokensRepository,
    private passwordResetTokensRepository: PasswordResetTokensRepository,
    private credentialsRepository: CredentialsRepository,
    private prisma: PrismaService,
    private mailService: MailService,
    private auditService: AuditService,
  ) {}

  async login(credentials: LoginDto, response: Response) {
    const user = await this.usersService.getUserByEmailWithPassword(
      credentials.email,
    );
    const isCorrectPassword = await bcrypt.compare(
      credentials.password,
      user?.password ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !isCorrectPassword) {
      throw new UnauthorizedException('Las credenciales son incorrectas');
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
      },
    };

    return loggedUser;
  }

  async refresh(request: Request, response: Response) {
    const refreshToken = (
      request.cookies as Record<string, string> | undefined
    )?.['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException(
        'No tienes permitido realizar esta acción',
      );
    }

    const denied = () =>
      new UnauthorizedException('No tienes permitido realizar esta acción');
    const storedToken = await this.refreshTokensRepository.findByHash(
      this.hashToken(refreshToken),
    );

    if (!storedToken) {
      throw denied();
    }

    /**
     * Deteccion de reutilizacion: un token ya revocado que vuelve a presentarse
     * indica robo o carrera; se cierran todas las sesiones del usuario.
     */
    if (storedToken.revoked_at) {
      await this.refreshTokensRepository.revokeAllForUser(storedToken.user_id);
      throw denied();
    }

    if (storedToken.expires_at.getTime() <= Date.now()) {
      throw denied();
    }

    const user = await this.usersService.getUserById(storedToken.user_id);

    if (!user.status) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada');
    }

    /**
     * Rotacion atomica: revocar el token usado y crear el nuevo en la misma
     * transaccion. Si otra peticion lo revoco primero (reuso concurrente), no
     * se emite nada.
     */
    const session = await this.prisma.$transaction(async (tx) => {
      const revoked = await this.refreshTokensRepository.revokeIfValid(
        storedToken.id,
        tx,
      );

      if (!revoked) {
        return null;
      }

      return await this.createSession(user, tx);
    });

    if (!session) {
      await this.refreshTokensRepository.revokeAllForUser(storedToken.user_id);
      throw denied();
    }

    this.setAuthCookies(response, session);

    return { refreshed: true };
  }

  async logout(request: Request, response: Response) {
    const refreshToken = (
      request.cookies as Record<string, string> | undefined
    )?.['refresh_token'];

    if (refreshToken) {
      await this.refreshTokensRepository.revokeByHash(
        this.hashToken(refreshToken),
      );
    }

    response.clearCookie('access_token', baseCookieOptions());

    response.clearCookie('refresh_token', {
      ...baseCookieOptions(),
      path: '/auth',
    });

    return { loggedOut: true };
  }

  async createToken(payload: Record<string, unknown>) {
    return await this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY_MS / 1000,
    });
  }

  private async issueTokens(user: TokenUser, response: Response) {
    const session = await this.createSession(user);

    this.setAuthCookies(response, session);
  }

  /** Genera el access token y persiste el refresh token (hash); no toca la respuesta. */
  private async createSession(user: TokenUser, tx?: Prisma.TransactionClient) {
    // Payload minimo: los datos del usuario se leen de la BD (GET /auth/me).
    const payload = {
      id: user.id,
      role: user.role.role,
    };

    const accessToken = await this.createToken(payload);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_MS,
    );

    await this.refreshTokensRepository.create(
      user.id,
      this.hashToken(refreshToken),
      refreshTokenExpiresAt,
      tx,
    );

    return { accessToken, refreshToken };
  }

  private setAuthCookies(
    response: Response,
    session: { accessToken: string; refreshToken: string },
  ) {
    response.cookie('access_token', session.accessToken, {
      ...baseCookieOptions(),
      maxAge: ACCESS_TOKEN_EXPIRY_MS,
    });

    response.cookie('refresh_token', session.refreshToken, {
      ...baseCookieOptions(),
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
      role: Role.PACIENTE,
    };

    return await this.usersService.createUser(patientUser);
  }

  async me(userId: number) {
    const user = await this.credentialsRepository.findProfileById(userId);

    if (!user || !user.status) {
      throw new UnauthorizedException(
        'No tienes permitido realizar esta acción',
      );
    }

    return {
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      status: user.status,
      created_at: user.created_at,
      role: user.role.role,
      patient_id: user.patient?.id ?? null,
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.credentialsRepository.findWithPasswordById(userId);

    if (!user || !user.status) {
      throw new UnauthorizedException(
        'No tienes permitido realizar esta acción',
      );
    }

    const isCorrect = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isCorrect) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser distinta a la actual',
      );
    }

    const hashed = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      await this.credentialsRepository.updatePassword(userId, hashed, tx);
      await this.refreshTokensRepository.revokeAllForUser(userId, tx);
      await this.passwordResetTokensRepository.invalidateAllForUser(userId, tx);
      // Solo el hecho del cambio: nunca la contraseña ni su hash
      await this.auditService.log(
        {
          userId,
          action: AuditAction.PASSWORD_CHANGED,
          entity: AuditEntity.USER,
          entityId: userId,
        },
        tx,
      );
    });

    return { changed: true };
  }

  /**
   * Responde siempre igual exista o no el correo. El envio del correo no se
   * espera (no bloquea ni delata la existencia por tiempo de respuesta).
   */
  async forgotPassword(email: string) {
    // El 503 no depende de si el correo existe: no se simula exito sin SMTP.
    if (!this.mailService.isConfigured()) {
      throw new ServiceUnavailableException(
        'La recuperación de contraseña no está disponible',
      );
    }

    const user = await this.credentialsRepository.findByEmail(email);

    if (user && user.status) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

      await this.prisma.$transaction(async (tx) => {
        // Bloqueo de fila: dos solicitudes simultaneas no dejan dos tokens validos.
        await this.credentialsRepository.lockUserById(user.id, tx);
        await this.passwordResetTokensRepository.invalidateAllForUser(
          user.id,
          tx,
        );
        // Solo se guarda el hash: el token en claro unicamente viaja por correo.
        await this.passwordResetTokensRepository.create(
          user.id,
          this.hashToken(token),
          expiresAt,
          tx,
        );
      });

      void this.mailService.sendPasswordResetEmail(
        user.email,
        user.name,
        token,
      );
    }

    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const invalid = () =>
      new BadRequestException(
        'El enlace de recuperación es inválido o ha expirado',
      );
    const tokenHash = this.hashToken(dto.token);

    // Validacion barata antes del bcrypt (costoso): evita CPU con tokens basura.
    const preliminary =
      await this.passwordResetTokensRepository.findByHash(tokenHash);

    if (
      !preliminary ||
      preliminary.used_at ||
      preliminary.expires_at <= new Date()
    ) {
      throw invalid();
    }

    const hashed = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      const stored = await this.passwordResetTokensRepository.findByHash(
        tokenHash,
        tx,
      );

      if (!stored) {
        throw invalid();
      }

      // Consumo atomico: un solo uso y solo si no ha expirado.
      const consumed = await this.passwordResetTokensRepository.consumeIfValid(
        stored.id,
        tx,
      );

      if (!consumed) {
        throw invalid();
      }

      const user = await this.credentialsRepository.findWithPasswordById(
        stored.user_id,
        tx,
      );

      if (!user || !user.status) {
        throw invalid();
      }

      await this.credentialsRepository.updatePassword(user.id, hashed, tx);
      await this.passwordResetTokensRepository.invalidateAllForUser(
        user.id,
        tx,
      );
      await this.refreshTokensRepository.revokeAllForUser(user.id, tx);
      await this.auditService.log(
        {
          userId: user.id,
          action: AuditAction.PASSWORD_RESET,
          entity: AuditEntity.USER,
          entityId: user.id,
        },
        tx,
      );
    });

    return { reset: true };
  }
}
