import { Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { ConsultationsRepository } from './repositories/consultations.repository';
import { AppointmentsRepository } from '../appointments/repositories/appointments.repository';
import { SecurityModule } from 'src/infrastructure/security/security.module';

@Module({
  controllers: [ConsultationsController],
  providers: [
    ConsultationsService,
    ConsultationsRepository,
    AppointmentsRepository,
  ],
  imports: [
    SecurityModule
  ]
})
export class ConsultationsModule {}
