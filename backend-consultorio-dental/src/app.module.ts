import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CitasModule } from './modules/citas/citas.module';
import { PatientsModule } from './modules/patients/patients.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { ServicesModule } from './modules/services/services.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    CitasModule,
    PatientsModule,
    SecurityModule,
    ServicesModule,
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
