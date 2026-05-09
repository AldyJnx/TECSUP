import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip } = req;
    const correlationId = req.correlationId ?? 'unknown';
    const userId = req.user?.id ?? 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const ms = Date.now() - start;
          this.logger.log(
            `${method} ${url} ${res.statusCode} ${ms}ms | correlationId=${correlationId} userId=${userId} ip=${ip}`,
          );
        },
        error: (err: unknown) => {
          const ms = Date.now() - start;
          this.logger.warn(
            `${method} ${url} ERROR ${ms}ms | correlationId=${correlationId} userId=${userId} err=${String(err)}`,
          );
        },
      }),
    );
  }
}
