import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformResponseInterceptor } from './infrastructure/common/interceptors/transform-response.interceptor'
import cookieParser from 'cookie-parser';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? '',
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // INDICACION: Permite transformar los datos del JSON
    whitelist: true, // INDICACION: Elimina los campos que no están en el DTO
    stopAtFirstError: true, //INDICACION: Solo devuelve el primer error de cada campo del DTO
  }));

  app.useGlobalInterceptors(new TransformResponseInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
