import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  constructor() {

    const server = process.env["DATABASE_HOST"];
    const database = process.env["DATABASE_NAME"];
    const user = process.env["DATABASE_USER"];
    const password = process.env["DATABASE_PASSWORD"];

    if (!server || !database || !user || !password) {
      throw new Error(
        'Faltan variables de entorno para la conexión a SQL Server. ' +
        'Verifica DB_HOST, DB_NAME, DB_USER y DB_PASSWORD en tu .env'
      );
    }

    const adapter = new PrismaMssql({
      server: server,
      port: Number(process.env["DATABASE_PORT"]) || 1433,
      database: database,
      user: user,
      password: password,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    });

    super({ adapter, omit: { usuario: { contraseña: true}} });



  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
