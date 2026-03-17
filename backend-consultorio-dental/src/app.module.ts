import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CitasModule } from './modules/citas/citas.module';
import { PacientesModule } from './modules/pacientes/pacientes.module';
import { SecurityModule } from './modules/security/security.module';
//import { APP_GUARD } from '@nestjs/core';
//import { AuthGuard } from './modules/security/guards/auth.guard';

@Module({
  imports: [
    PrismaModule,
    UsuariosModule,
    AuthModule,
    PrismaModule,
    CitasModule,
    PacientesModule,
    SecurityModule,
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
