import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { TransformResponseInterceptor } from './infrastructure/common/interceptors/transform-response.interceptor';
import { GlobalExceptionFilter } from './infrastructure/common/filters/global-exception.filter';
import { parseTrustProxyHops } from './infrastructure/security/env-validation';

/** Limite de body JSON por defecto (el mismo que trae Express/Nest). */
const DEFAULT_JSON_LIMIT = '100kb';
/**
 * Tope de body JSON SOLO para /consultations (notas clinicas largas). Con
 * MAX_TEXT = 50.000 caracteres por campo (2 campos) el peor caso son ~400 KB
 * en UTF-8, asi que 1 MB cubre el maximo permitido por el DTO con holgura.
 */
const CONSULTATIONS_JSON_LIMIT = '1mb';

/**
 * Configuracion HTTP de la aplicacion (parsers, CORS, pipes, filtro e
 * interceptor). Es la misma para produccion (main.ts) y para las pruebas
 * e2e, de modo que las pruebas ejercitan la configuracion real.
 * La app debe crearse con `bodyParser: false`.
 */
export function configureApp(app: INestApplication) {
  const expressApp = app as NestExpressApplication;
  const trustProxyHops = parseTrustProxyHops();

  // Numero de proxies de confianza delante de la app (0 = ninguno). Nunca `true`.
  expressApp.set('trust proxy', trustProxyHops);

  // El parser de /consultations va primero: al quedar el body ya leido, el
  // parser global (100 kb) no vuelve a procesarlo. El resto de rutas no cambia.
  expressApp.use('/consultations', json({ limit: CONSULTATIONS_JSON_LIMIT }));
  expressApp.use(json({ limit: DEFAULT_JSON_LIMIT }));
  expressApp.use(urlencoded({ extended: true, limit: DEFAULT_JSON_LIMIT }));

  expressApp.use(cookieParser());

  expressApp.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  expressApp.useGlobalPipes(
    new ValidationPipe({
      transform: true, // INDICACION: Permite transformar los datos del JSON
      whitelist: true, // INDICACION: Elimina los campos que no están en el DTO
      stopAtFirstError: true, //INDICACION: Solo devuelve el primer error de cada campo del DTO
    }),
  );

  expressApp.useGlobalFilters(new GlobalExceptionFilter());

  expressApp.useGlobalInterceptors(new TransformResponseInterceptor());
}
