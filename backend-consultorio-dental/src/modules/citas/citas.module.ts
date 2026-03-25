import { Module } from '@nestjs/common';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { RepositorioCitas } from './repositories/citas.repository';
import { RepositorioServicios } from '../servicios/repositories/servicios.repository';
import { RepositorioPaciente } from '../pacientes/repositories/pacientes.repository';

@Module({
  controllers: [CitasController],
  providers: [
    CitasService, 
    RepositorioCitas, 
    RepositorioServicios, 
    RepositorioPaciente
  ]
})
export class CitasModule {}
