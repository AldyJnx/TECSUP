import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuditLogService } from './audit-log.service';

export const AUDIT_KEY = 'audit:resource';

export const Audit = (resource: string) => SetMetadata(AUDIT_KEY, resource);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLog: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const resource = this.reflector.get<string>(AUDIT_KEY, context.getHandler());
    if (!resource) return next.handle();

    const req = context.switchToHttp().getRequest();
    const action = `${req.method} ${req.route?.path ?? req.url}`;
    const user = req.user;
    const resourceId = req.params?.id ?? null;
    const ip = req.ip ?? req.headers['x-forwarded-for'] ?? null;
    const userAgent = req.headers['user-agent'] ?? null;
    const correlationId = req.correlationId ?? null;

    const baseMeta = { correlationId, body: this.scrub(req.body) };

    return next.handle().pipe(
      tap((response: unknown) => {
        void this.auditLog.record({
          userId: user?.id,
          action,
          resource,
          resourceId,
          metadata: JSON.parse(
            JSON.stringify({ ...baseMeta, response: this.scrub(response) }),
          ),
          ipAddress: typeof ip === 'string' ? ip : null,
          userAgent,
          success: true,
        });
      }),
      catchError((err: { message?: string; status?: number }) => {
        void this.auditLog.record({
          userId: user?.id,
          action,
          resource,
          resourceId,
          metadata: JSON.parse(
            JSON.stringify({
              ...baseMeta,
              error: err?.message ?? null,
              status: err?.status ?? null,
            }),
          ),
          ipAddress: typeof ip === 'string' ? ip : null,
          userAgent,
          success: false,
        });
        return throwError(() => err);
      }),
    );
  }

  private scrub(payload: unknown): unknown {
    if (!payload || typeof payload !== 'object') return payload;
    const sensitive = ['password', 'passwordHash', 'mfaSecret', 'refreshToken', 'accessToken', 'mfaToken'];
    const clone: Record<string, unknown> = { ...(payload as Record<string, unknown>) };
    for (const key of Object.keys(clone)) {
      if (sensitive.includes(key)) clone[key] = '***';
    }
    return clone;
  }
}
