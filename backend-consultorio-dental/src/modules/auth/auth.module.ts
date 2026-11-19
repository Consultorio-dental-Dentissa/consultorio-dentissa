import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { MailModule } from '../../infrastructure/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { PasswordResetTokensRepository } from './repositories/password-reset-tokens.repository';
import { CredentialsRepository } from './repositories/credentials.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokensRepository,
    PasswordResetTokensRepository,
    CredentialsRepository,
  ],
  imports: [
    UsersModule,
    SecurityModule,
    JwtModule,
    MailModule,
    // Limites por defecto; solo aplican donde se usa ThrottlerGuard (endpoints de auth).
    ThrottlerModule.forRoot([{ ttl: 60 * 1000, limit: 10 }]),
  ],
})
export class AuthModule {}
