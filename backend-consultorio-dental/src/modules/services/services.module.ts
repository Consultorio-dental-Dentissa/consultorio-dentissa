import { Module } from '@nestjs/common';
import { ServiciosController } from './services.controller';
import { ServicesService } from './services.service';
import { ServicesRepository } from './repositories/services.repository';
import { SecurityModule } from '../../infrastructure/security/security.module';

@Module({
  imports: [
    SecurityModule,
  ],
  controllers: [
    ServiciosController
  ],
  providers: [
    ServicesService, 
    ServicesRepository
  ],
  exports: [ServicesRepository]
})
export class ServicesModule {}
