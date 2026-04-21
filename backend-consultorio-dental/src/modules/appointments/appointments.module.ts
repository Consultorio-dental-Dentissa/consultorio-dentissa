import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { ServicesRepository } from '../services/repositories/services.repository';
import { PatientsRepository } from '../patients/repositories/patients.repository';
import { SecurityModule } from 'src/infrastructure/security/security.module';

@Module({
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService, 
    AppointmentsRepository, 
    ServicesRepository, 
    PatientsRepository,
  ],
  imports: [
    SecurityModule
  ]
})
export class AppointmentsModule {}
