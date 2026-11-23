import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PatientsModule } from './modules/patients/patients.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { ServicesModule } from './modules/services/services.module';
import { CommonModule } from './infrastructure/common/common.module';
import { AuditModule } from './modules/audit/audit.module';
import { FaqModule } from './modules/faq/faq.module';
import { OffersModule } from './modules/offers/offers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { OdontogramModule } from './modules/odontogram/odontogram.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    AppointmentsModule,
    PatientsModule,
    SecurityModule,
    ServicesModule,
    CommonModule,
    AuditModule,
    FaqModule,
    OffersModule,
    NotificationsModule,
    DashboardModule,
    StorageModule,
    ConsultationsModule,
    OdontogramModule,
  ],
  controllers: [AppController],
  providers: [
    /*
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    */
    AppService,
  ],
})
export class AppModule {}
