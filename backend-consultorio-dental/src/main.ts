import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { assertJwtSecret } from './infrastructure/security/env-validation';

async function bootstrap() {
  assertJwtSecret();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Se desactiva el parser por defecto para fijar limites por ruta
    bodyParser: false,
  });

  configureApp(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
