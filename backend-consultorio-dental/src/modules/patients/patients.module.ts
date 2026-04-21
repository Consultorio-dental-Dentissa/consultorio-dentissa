import { Module } from '@nestjs/common';
import { PacientesController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './repositories/patients.repository';
import { SecurityModule } from '../../infrastructure/security/security.module';
@Module({
  controllers: [PacientesController],
  providers: [
    PatientsService, 
    PatientsRepository
  ],
  exports: [PatientsRepository],
  imports: [
    SecurityModule
  ]
})
export class PatientsModule {}
