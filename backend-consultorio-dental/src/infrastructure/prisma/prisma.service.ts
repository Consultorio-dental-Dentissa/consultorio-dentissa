import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

  constructor() {
    super({
      omit: {
        usuario: {
          contraseña: true, // omite password en TODAS las consultas de usuario
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

}