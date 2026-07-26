import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { PatientsModule } from '../patients/patients.module';
import { OdontogramsModule } from '../odontograms/odontograms.module';
import { SecurityModule } from '../../infrastructure/security/security.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
  imports: [PatientsModule, OdontogramsModule, SecurityModule]
})
export class UsersModule {}
