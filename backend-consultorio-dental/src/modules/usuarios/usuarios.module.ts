import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { RepositorioUsuario } from './repositories/usuarios.repository';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService, RepositorioUsuario],
  exports: [RepositorioUsuario]
})
export class UsuariosModule {}
