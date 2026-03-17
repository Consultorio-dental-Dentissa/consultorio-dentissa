import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { RepositorioUsuario } from './repositories/usuarios.repository';
import { PacientesModule } from '../pacientes/pacientes.module';
import { SecurityModule } from '../security/security.module';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService, RepositorioUsuario],
  exports: [UsuariosService],
  imports: [PacientesModule, SecurityModule]
})
export class UsuariosModule {}
