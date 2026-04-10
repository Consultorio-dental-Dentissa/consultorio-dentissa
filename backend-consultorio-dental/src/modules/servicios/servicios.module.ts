import { Module } from '@nestjs/common';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';
import { RepositorioServicios } from './repositories/servicios.repository';
import { SecurityModule } from '../../infrastructure/security/security.module';

@Module({
  imports: [
    SecurityModule,
  ],
  controllers: [
    ServiciosController
  ],
  providers: [
    ServiciosService, 
    RepositorioServicios
  ],
  exports: [RepositorioServicios]
})
export class ServiciosModule {}
