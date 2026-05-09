import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request as any).correlationId ?? 'unknown';
    const isProduction = process.env.NODE_ENV === 'production';

    let statusCode: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = Array.isArray(resp.message)
          ? (resp.message as string[]).join(', ')
          : (resp.message as string) || exception.message;
        error = (resp.error as string) || exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = isProduction ? 'Internal server error' : String(exception);
      error = 'InternalServerError';

      this.logger.error(
        `Unhandled exception [${correlationId}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
