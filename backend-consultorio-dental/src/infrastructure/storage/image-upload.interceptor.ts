import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { MAX_IMAGE_BYTES, MAX_IMAGES_PER_ENTITY } from './image-validation';

/** Opciones de multer compartidas: memoria, limite de tamano y de cantidad. */
export const IMAGE_UPLOAD_OPTIONS = {
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: MAX_IMAGES_PER_ENTITY,
    fields: 5,
    parts: MAX_IMAGES_PER_ENTITY + 5,
  },
};

export function translateUploadError(error: unknown): unknown {
  if (!(error instanceof HttpException)) return error;
  if (error instanceof PayloadTooLargeException) {
    return new PayloadTooLargeException(
      `Cada imagen debe pesar como máximo ${MAX_IMAGE_BYTES / (1024 * 1024)} MB`,
    );
  }
  if (error instanceof BadRequestException) {
    const body = error.getResponse();
    const raw =
      typeof body === 'string' ? body : (body as { message?: unknown }).message;
    // Mensajes en ingles de multer; los propios (en espanol) no se tocan
    if (
      typeof raw === 'string' &&
      /unexpected|too many|multipart|boundary|field/i.test(raw)
    ) {
      return new BadRequestException(
        `Solicitud de subida no válida: usa multipart/form-data, el campo de archivos indicado y máximo ${MAX_IMAGES_PER_ENTITY} imágenes`,
      );
    }
  }
  return error;
}

/** Traduce a espanol los errores de multer (tamano, cantidad, campo inesperado). */
@Injectable()
export class UploadErrorInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next
      .handle()
      .pipe(
        catchError((error) => throwError(() => translateUploadError(error))),
      );
  }
}
