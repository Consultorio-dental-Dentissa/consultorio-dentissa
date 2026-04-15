import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { PacientesModule } from '../pacientes/pacientes.module';
import { SecurityModule } from '../../infrastructure/security/security.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
  imports: [PacientesModule, SecurityModule]
})
export class UsersModule {}
