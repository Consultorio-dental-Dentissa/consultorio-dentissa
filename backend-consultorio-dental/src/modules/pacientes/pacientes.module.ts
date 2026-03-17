import { Module } from '@nestjs/common';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { RepositorioPaciente } from './repositories/pacientes.repository';
import { SecurityModule } from '../security/security.module';

@Module({
  controllers: [PacientesController],
  providers: [PacientesService, RepositorioPaciente],
  exports: [RepositorioPaciente],
  imports: [SecurityModule]
})
export class PacientesModule {}
