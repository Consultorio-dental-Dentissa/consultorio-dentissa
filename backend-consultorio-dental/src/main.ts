import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,       // elimina campos que no están en el DTO
    forbidNonWhitelisted: true, // lanza error si llegan campos extra
  }))

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
