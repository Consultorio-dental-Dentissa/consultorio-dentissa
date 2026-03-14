import { Module } from '@nestjs/common';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { RepositorioPaciente } from './repositories/pacientes.repository';

@Module({
  controllers: [PacientesController],
  providers: [PacientesService, RepositorioPaciente],
  exports: [RepositorioPaciente]
})
export class PacientesModule {}
