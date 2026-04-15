import { Module } from '@nestjs/common';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { RepositorioCitas } from './repositories/citas.repository';
import { ServicesRepository } from '../services/repositories/services.repository';
import { PatientsRepository } from '../patients/repositories/patients.repository';
import { SecurityModule } from 'src/infrastructure/security/security.module';

@Module({
  controllers: [CitasController],
  providers: [
    CitasService, 
    RepositorioCitas, 
    ServicesRepository, 
    PatientsRepository,
  ],
  imports: [
    SecurityModule
  ]
})
export class CitasModule {}
