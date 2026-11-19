import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL no definida');
    }

    // Esquema opcional (si no se define, el del datasource). Lo usan las
    // pruebas e2e para aislarse en un esquema propio (DATABASE_SCHEMA=e2e_test).
    const schema = process.env.DATABASE_SCHEMA?.trim();

    const adapter = new PrismaPg(
      { connectionString },
      schema ? { schema } : undefined,
    );

    super({
      adapter,
      log: ['error', 'warn'],
      omit: {
        user: {
          password: true,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
