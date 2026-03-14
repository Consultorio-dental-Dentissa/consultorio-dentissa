import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { RepositorioUsuario } from './repositories/usuarios.repository';
import { PacientesModule } from '../pacientes/pacientes.module';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService, RepositorioUsuario],
  exports: [RepositorioUsuario],
  imports: [PacientesModule]
})
export class UsuariosModule {}
