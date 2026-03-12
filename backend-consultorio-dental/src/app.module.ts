import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CitasModule } from './citas/citas.module';

@Module({
  imports: [UsuariosModule, AuthModule, PrismaModule, CitasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
