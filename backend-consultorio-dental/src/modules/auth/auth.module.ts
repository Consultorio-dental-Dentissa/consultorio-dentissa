import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensRepository],
  imports: [UsersModule, SecurityModule, JwtModule]
})
export class AuthModule {}
