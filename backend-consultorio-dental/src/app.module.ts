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
  ],
  controllers: [AppController],
  providers: [
    /*
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    */
    AppService
  ],
})
export class AppModule { }
