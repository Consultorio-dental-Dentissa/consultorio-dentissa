import { Module } from '@nestjs/common';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { RepositorioCitas } from './repositories/citas.repository';
import { RepositorioServicios } from '../servicios/repositories/servicios.repository';
import { PatientsRepository } from '../patients/repositories/patients.repository';
import { SecurityModule } from 'src/infrastructure/security/security.module';

@Module({
  controllers: [CitasController],
  providers: [
    CitasService, 
    RepositorioCitas, 
    RepositorioServicios, 
    PatientsRepository,
  ],
  imports: [
    SecurityModule
  ]
})
export class CitasModule {}
