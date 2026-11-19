import { Module } from '@nestjs/common';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { ConsultationsRepository } from './repositories/consultations.repository';

@Module({
  imports: [SecurityModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, ConsultationsRepository],
  exports: [ConsultationsRepository],
})
export class ConsultationsModule {}
