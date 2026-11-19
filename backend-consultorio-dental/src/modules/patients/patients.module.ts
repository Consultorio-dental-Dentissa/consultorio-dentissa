import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PacientesController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './repositories/patients.repository';
import { ConsultationsModule } from '../consultations/consultations.module';
import { MailModule } from '../../infrastructure/mail/mail.module';
import { SecurityModule } from '../../infrastructure/security/security.module';
@Module({
  controllers: [PacientesController],
  providers: [PatientsService, PatientsRepository],
  exports: [PatientsRepository],
  imports: [
    SecurityModule,
    ConsultationsModule,
    MailModule,
    // Habilita UserThrottlerGuard en PATCH /patients/me (5/min por usuario)
    ThrottlerModule.forRoot([{ ttl: 60 * 1000, limit: 10 }]),
  ],
})
export class PatientsModule {}
