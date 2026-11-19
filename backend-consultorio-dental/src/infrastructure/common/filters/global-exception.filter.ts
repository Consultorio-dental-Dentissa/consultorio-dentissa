import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';

export interface HandledError {
  status: number;
  message: string;
}

/**
 * Traduce errores conocidos de Prisma a respuestas HTTP con mensaje en español.
 * Devuelve null si el error no es un error conocido de Prisma.
 */
export function handlePrismaError(exception: unknown): HandledError | null {
  if (exception instanceof Prisma.PrismaClientValidationError) {
    // Su message incluye datos del query; se responde un 400 generico
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Los datos enviados no son válidos',
    };
  }

  if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  switch (exception.code) {
    case 'P2025':
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'El recurso solicitado no existe',
      };
    case 'P2002': {
      // El objetivo (columna/indice) viene en meta; solo se usa para elegir el mensaje
      const target = JSON.stringify(exception.meta ?? {}).toLowerCase();
      let message = 'Ya existe un registro con esos datos';
      if (target.includes('phone')) {
        message = 'Este teléfono ya está registrado';
      } else if (target.includes('email')) {
        message = 'Este correo ya está registrado';
      }
      return { status: HttpStatus.CONFLICT, message };
    }
    case 'P2003':
      return {
        status: HttpStatus.CONFLICT,
        message:
          'La operación referencia un registro que no existe o está en uso',
      };
    case 'P2028':
      // Transaccion interactiva vencida o sin conexion disponible
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'El servidor está ocupado. Intenta de nuevo',
      };
    case 'P2034':
      return {
        status: HttpStatus.CONFLICT,
        message: 'La operación entró en conflicto con otra. Inténtalo de nuevo',
      };
    default:
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ocurrió un error interno. Inténtalo más tarde',
      };
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocurrió un error interno. Inténtalo más tarde';
    let errors: string[] | undefined;

    const prismaError = handlePrismaError(exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else {
        const raw = (body as { message?: string | string[] }).message;

        if (Array.isArray(raw)) {
          // Errores de validación (class-validator)
          message = raw[0] ?? 'Los datos enviados no son válidos';
          errors = raw;
        } else if (raw) {
          message = raw;
        }
      }
    } else if (
      (exception as { type?: unknown } | null)?.type === 'entity.too.large'
    ) {
      // body-parser: el JSON supera el limite de la ruta
      status = HttpStatus.PAYLOAD_TOO_LARGE;
      message = 'El cuerpo de la solicitud es demasiado grande';
    } else if (prismaError) {
      status = prismaError.status;
      message = prismaError.message;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Solo name y code; nunca message ni datos del request (pueden ser sensibles)
      let detail = 'Error desconocido';

      if (exception instanceof Error) {
        const code = (exception as { code?: unknown }).code;
        detail =
          typeof code === 'string'
            ? `${exception.name} (${code})`
            : exception.name;
      }

      this.logger.error(detail);
    }

    response.status(status).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
      statusCode: status,
    });
  }
}
