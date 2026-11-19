import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Descargas de archivos: se envian tal cual, sin envolver en ApiResponse
        if (data instanceof StreamableFile) return data;

        return {
          success: true,
          message: 'OK',
          data,
        };
      }),
    );
  }
}
