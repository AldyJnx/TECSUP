import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface TransformedResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    const res = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data: T) => ({
        statusCode: res.statusCode,
        message: 'OK',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
